
const { extractTextFromFile } = require("./scrapper/scrapper.service");
const { v4: uuidv4 } = require('uuid');
const Campaign = require("../../models/campaign/campaign.model");
const Lead = require("../../models/leads/leads.model");
const { compiledGraph } = require("./campaignGraph");

const createCampaign = async (campaignData, file) => {
    try {
        const { name, companyUrl, senderAccount, leadEmails } = campaignData;

        const fileContent = await extractTextFromFile(file);
        const fileName = file.originalname;
        const campaign = await Campaign.create({ name, companyUrl, senderAccount, documents: [fileName] });
        // const compiledGraph = await startGraph();
        const leadArray = Array.isArray(leadEmails)
            ? leadEmails
            : leadEmails.split(",").map((e) => e.trim());

        const threadIds = {};

        for (const email of leadArray) {
            const threadId = uuidv4();
            const lead = await Lead.create({ graphThreadId: threadId, campaignId: campaign._id, email });

            const initialState = {
                campaignId: campaign._id.toString(),
                lead: { id: lead._id.toString(), email },
                fileContent,
            };


            threadIds[lead._id.toString()] = threadId;
            compiledGraph.invoke(initialState, { configurable: { thread_id: threadId } });
        }

    } catch (err) {
        console.error(err);
        throw new Error(err)
    }
}

module.exports = {
    createCampaign
}