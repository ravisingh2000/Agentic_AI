const { getBookingTemplate } = require("../../utils/calendlyTemplate");
const { sendMail } = require("./email.service");
const axios = require("axios")
const Lead = require("../../models/leads/leads.model")
const Account = require("../../models/accounts/account.model")
const sendCalendlyLink = async ({ campaign, lead_id, subject = "Invitation for meeting" }) => {
    const lead = await Lead.findById(lead_id)
    const account = await Account.findById(campaign.accountId)
    const bookingTemplate = getBookingTemplate('ravi', campaign._id, lead_id)
    const sendPayload = {
        subject: Lead.emailFlow[0].subject, messageId: Lead.messageId, threadId: lead.threadId, to: lead.email, from: 'raviamptest@gmail.com', text: "", html: bookingTemplate, replyTo: 'raviamptest@gmail.com', accessToken: account.config.access_token
    }
    await sendMail(sendPayload)
    await db.leads.updateOne(
        {
            campaignId: req.body.payload.utm_campaign,
            _id: req.body.payload.utm_content
        },
        {
            $set: { meetingScheduled: true },
            $push: {
                meetings: {
                    scheduledAt: new Date(req.body.payload.event.start_time),
                    calendlyEventUri: req.body.payload.event.replace("scheduled_events", "events"),
                    notes: req.body.payload.event.name || ""
                }
            },
            $push: {
                emailFlow: {
                    type: 'outbound',
                    body: ''
                }
            }
        },

    );

}
const calendlyConfimation = async (req, res) => {
    const event = req.body.event;

    if (event === 'invitee.created') {

        const email = req.body.payload.invitee.email;
        const time = req.body.payload.event.start_time;

        // 👉 Update your DB / LangGraph state
        console.log(`📅 Booking confirmed with ${email} at ${time}`);
        const bookingTemplate = getBookingTemplate('ravi', campaign._id, lead_id)
        // Example: update lead in DB
        await db.leads.updateOne(
            {
                campaignId: req.body.payload.utm_campaign,
                _id: req.body.payload.utm_content
            },
            {
                $set: { meetingScheduled: true },
                $push: {
                    meetings: {
                        scheduledAt: new Date(req.body.payload.event.start_time),
                        calendlyEventUri: req.body.payload.event.replace("scheduled_events", "events"),
                        notes: req.body.payload.event.name || ""
                    }
                },
                $push: {
                    emailFlow: {
                        type: 'outbound',
                        body: ''
                    }
                }
            },

        );

        res.status(200).send('Received Calendly webhook');
    } else {
        res.status(400).send('Ignored');
    }
}

const api = axios.create({
    baseURL: 'https://api.calendly.com',
    headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

async function getOrganizationUri() {
    try {
        const res = await api.get('/users/me');
        return res.data.resource.current_organization;
    }
    catch (error) {
        console.log(error)
    }

}
const createWebhook = async () => {
    console.log('dd')
    try {
        const orgUri = await getOrganizationUri();
        console.log(orgUri)
        const webhook_url = process.env.WEBHOOK_URL
        const payload = {
            url: webhook_url,
            events: ['invitee.created', 'invitee.canceled'],
            organization: orgUri,
            scope: "organization"
        };

        const res = await api.post('/webhook_subscriptions', payload);
        console.log('✅ Webhook created:\n', res.data.resource);
        return res.data.resource.uri; // store this to delete later
    }
    catch (error) {
        console.log(error)
    }
}

const deleteWebhook = async () => {
    try {
        const webhookUri = process.env.WEBHOOK_URL;
        await api.delete(webhookUri);
        console.log('❌ Webhook deleted:', webhookUri);
    } catch (error) {
        console.error('Failed to delete webhook:', error.response?.data || error.message);
    }
}

module.exports = { createWebhook, deleteWebhook, sendCalendlyLink, calendlyConfimation };
