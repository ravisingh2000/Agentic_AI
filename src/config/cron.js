require('dotenv').config();
const cron = require('node-cron');
const emailReplyListener = require('../v1/services/replyListener.service');
const { initCheckpointer, compiledGraph } = require('../v1/services/campaignGraph');
const Account = require("../models/accounts/account.model")
const { Command } = require('@langchain/langgraph');
const THREADS = require('../utils/thread');
// Simulated data (should come from DB ideally)


const GMAIL_ACCESS_TOKEN = process.env.GMAIL_ACCESS_TOKEN;
const YOUR_EMAIL = process.env.YOUR_EMAIL;

cron.schedule('*/1 * * * *', async () => {
    console.log(` [${new Date().toISOString()}] Checking multiple threads...`);

    for (const thread of THREADS) {
        const { threadId, email, accountId, msgThreadId, lastMessageId } = thread;
        const account = await Account.findById(accountId);
        if (!account || !account.config.access_token) {
            console.warn(`⚠️ No token found for account ${accountId}`);
            continue; x
        }
        try {
            const newReplies = await emailReplyListener({
                accessToken: account.config.access_token,
                msgThreadId,
                yourEmail: email,
                account,
                lastMessageId
            });
            THREADS.pop()
            if (!newReplies.length) {
                console.log(` No new replies in thread ${msgThreadId}`);
                continue;
            }


            // const db = initCheckpointer()
            // const readConfig = {
            //     configurable: {
            //         thread_id: threadId
            //     }
            // };
            // const checkpointState = await db.get(readConfig);
            const cmd = new Command({ resume: { latest_reply: newReplies[0] } }, { update: { latest_reply: newReplies[0] } })
            await compiledGraph.invoke(
                cmd,
                { "configurable": { "thread_id": threadId, } }
            )

        } catch (err) {
            console.error(` Error checking thread ${threadId}:`, err.message);
        }
    }
});
