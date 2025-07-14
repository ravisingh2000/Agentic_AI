// models/lead.model.js
const mongoose = require("mongoose");
const { unsubscribe } = require("../../v1/routes/accounts/account.route");

const LeadSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campaign",
        required: true,
    },
    name: String,
    email: {
        type: String,
        required: true
    },
    company: String,
    role: String,

    emailStatus: {
        type: String,
        enum: ['pending', 'sent', 'replied', 'followed_up', 'meeting_scheduled', 'failed'],
        default: 'pending',
    },

    calendlyLink: String,

    meetings: [
        {
            scheduledAt: Date,
            createdAt: {
                type: Date,
                default: Date.now,
            },
            calendlyEventUri: String,
            notes: { type: String },
        }
    ],

    emailFlow: [
        {
            type: { type: String, enum: ["outbound", "inbound"], required: true },
            subject: String,
            body: String,
            messageId: String,
            threadId: String,
            sender: String,
            recipient: String,
            timestamp: Date,
            intent: String,
            summary: String,
            tracking: {
                open: { type: String },
                click: { type: String },
                unsubscribe: { type: String }
            }
        }
    ],


}, { timestamps: true });


module.exports = mongoose.model("lead", LeadSchema, 'leads');
