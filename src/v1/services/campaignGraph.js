const { MongoDBSaver } = require('@langchain/langgraph-checkpoint-mongodb');
const { StateGraph, Annotation, END, interrupt } = require("@langchain/langgraph");
const { MongoClient } = require("mongodb");
const scrapper = require('./scrapper/scrapper.service');
const { generateColdEmail, generateFollowUp } = require('./aiService');
const { sendMail } = require('./email.service');
const replyDecision = require('./replyDescion.service');
const { sendCalendlyLink } = require('./calendly.service');
const StateAnnotation = Annotation.Root({
    campaignId: Annotation(),
    lead: Annotation({
        id: Annotation(),
        email: Annotation(),
        reply: Annotation(),
        booked: Annotation(),
    }),
    summary: Annotation(),
    emailContent: Annotation(),
    fileContent: Annotation(),
    stage: Annotation(),
    initialEmail: Annotation(),
    latest_reply: Annotation(),
    followUpEmail: Annotation()
})

const client = new MongoClient(process.env.DB_URL);
const initCheckpointer = () => {
    const checkpointer = new MongoDBSaver({ client });
    return checkpointer;
}

// async function startGraph() {
const graph = new StateGraph(StateAnnotation)
    .addNode("summarizePdfAndWebsite", scrapper.summarizeCompanyAndDocument)
    .addNode("generateColdEmail", generateColdEmail)
    .addNode("sendColdEmail", sendMail)
    .addNode("waitForReply", (state) => {
        return interrupt();
    })
    .addNode("replyListener", replyDecision)
    .addNode("generateFollowUp", generateFollowUp)
    .addNode("sendFollowUpEmail", sendMail)
    .addNode("sendBookingConfirmation", sendCalendlyLink)
    // .addNode("endBookingFlow", END)
    .addEdge("__start__", "summarizePdfAndWebsite")
    .addEdge("summarizePdfAndWebsite", "generateColdEmail")
    .addEdge("generateColdEmail", "sendColdEmail")
    .addEdge("sendColdEmail", "waitForReply")
    .addEdge("waitForReply", "replyListener")
    .addEdge("generateFollowUp", "sendFollowUpEmail")
    .addConditionalEdges("replyListener", (state) => {
        if (state.reply === "interested") return "sendBookingConfirmation";
        if (state.reply === "not_interested") return END;
        return "generateFollowUp";
    })
    .addEdge("sendFollowUpEmail", "waitForReply")
    .addEdge("sendBookingConfirmation", END);

// // Loop back from follow-up to the reply listener
// .addEdge("sendFollowUpEmail", "replyListener")
// // End flow path

const checkpointer = initCheckpointer()
const compiledGraph = graph.compile({
    checkpointer,
    interrupt_before: ["waitForReply"],
}// pause to wait for reply input
);
// }

module.exports = { compiledGraph, initCheckpointer };


