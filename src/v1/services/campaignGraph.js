const { MongoDBSaver } = require('@langchain/langgraph-checkpoint-mongodb');
const { StateGraph, Annotation, END } = require("@langchain/langgraph");
const { MongoClient } = require("mongodb");
const scrapper = require('./scrapper/scrapper.service');
const { generateColdEmail } = require('./aiService');
const { sendMail } = require('./email.service');
const emailReplyListener = require('./replyListener.service');
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
});

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
    // .addNode("replyListener", emailReplyListener)
    // .addNode("sendFollowUpEmail", sendFollowUpEmail)
    // .addNode("sendBookingConfirmation", sendBookingConfirmation)
    // .addNode("endBookingFlow", endBookingFlow)
    // // Define the start and end of the graph
    .addEdge("__start__", "summarizePdfAndWebsite")
    // .addEdge("__end__", "endBookingFlow")
    // // Add direct edges
    .addEdge("summarizePdfAndWebsite", "generateColdEmail")
    // .addEdge("generateColdEmail", END);
    .addEdge("generateColdEmail", "sendColdEmail")
// .addEdge("sendColdEmail", "replyListener")
// // Add conditional routing from replyListener
// .addConditionalEdges(
//     "replyListener",
//     (state) => {
//         if (state.reply === "interested") return "sendBookingConfirmation";
//         if (state.reply === "not_interested") return "endBookingFlow";
//         return "sendFollowUpEmail";
//     }
// )
// // Loop back from follow-up to the reply listener
// .addEdge("sendFollowUpEmail", "replyListener")
// // End flow path
// .addEdge("sendBookingConfirmation", "endBookingFlow");
const checkpointer = initCheckpointer()
const compiledGraph = graph.compile({
    checkpointer
}
    // interrupt_before: ["replyListener"],  // pause to wait for reply input
);
// }

module.exports = { compiledGraph, initCheckpointer };


