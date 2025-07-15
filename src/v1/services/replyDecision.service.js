const { generateWithGemini } = require("./aiService");

const replyDecision = async (state, inputs, options) => {

    const replyText = state.latest_reply.body;
    const sentMessages = [{ ...state.initialEmail }]
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                intent: { type: "string", enum: ["interested", "not_interested", "unclear"] },
                replyNeeded: { type: "boolean" },
                replyMessage: { type: "string" },
                replyToStep: { type: "string" }
            },
            required: ["intent", "replyNeeded", "replyMessage", "replyToStep"]
        },

    };



    const prompt = `
You are a reply classification and generation agent.

The user replied: "${replyText}"

Here is the context of all emails sent to this user:

${sentMessages
            .map(
                (m, i) => `Message ${i + 1} :\n${m.body || "Sent message text..."}\n`
            )
            .join("\n")}

Decide what to do:
- Is the reply positive, negative, or unclear?
- Should we reply? If yes, generate a short contextual reply.
- Which message was this reply responding to?

Return the result in JSON:
`;


    try {
        const response = await generateWithGemini(prompt, generationConfig);

        const descision = JSON.parse(response);

        return {
            ...state,
            replyAnalysis: descision,
            stage: "reply_decided",
        };
    } catch (err) {
        console.log(err)
    }
}

module.exports = replyDecision
