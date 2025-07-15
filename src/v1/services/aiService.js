
const axios = require("axios");
const Lead = require("../../models/leads/leads.model")
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
const schema = {
    type: "object",
    properties: {
        subject: { type: "string", description: "Email subject line" },
        body: { type: "string", description: "Email body text, personalized outreach, friendly tone" }
    },
    required: ["subject", "body"]
};

const generateWithGemini = async (prompt, generationConfig = {}) => {
    const res = await axios.post(
        GEMINI_URL,
        {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            ...(generationConfig ? { generationConfig } : {}),
        }
        ,
        {
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY
            },
        }
    );

    const candidates = res.data?.candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || "";
}


const generateColdEmail = async (state) => {
    const { lead, summary } = state;
    const leadData = await Lead.findById(lead.id)
    const prompt = `
You are a sales agent writing cold outreach emails.

Write a short and personalized outreach email for the following lead:

- Name: ${leadData.name}
- Email: ${leadData.email}
- Company: ${leadData.company}
- Role: ${leadData.role}

Company overview: ${summary}

Keep it short, professional, and focus on how we can help them improve their business. Include a soft CTA to chat or connect.

`;


    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };
    const response = await generateWithGemini(prompt, generationConfig);
    const initialEmail = JSON.parse(response);

    return {
        ...state,
        initialEmail,
        stage: "intial_email_generated",
    };
}

const generateFollowUp = async (state) => {
    const { lead, summary, initialEmail, latest_reply } = state;
    const leadData = await Lead.findById(lead.id)
    const prompt = `
You're a helpful SDR writing a reply to a lead.

Last reply from lead:
"${latest_reply.body}"

Write a polite, relevant response that:
- Answers their concern
- Suggests booking a short call
- Keeps tone warm and human

Use the following lead info:
- Name: ${leadData.name}
- Role: ${leadData.role}
- Company: ${leadData.company}
- Summary:${summary}
- initialEmail:${initialEmail.body}
`;
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };

    const reply = await generateWithGemini(prompt, generationConfig);
    const parsedReply = JSON.parse(reply)
    return {
        ...state,
        followUpEmail: parsedReply,
        stage: "follow_up_generated",
    };
}



module.exports = { generateColdEmail, generateFollowUp, generateWithGemini };
