// models/campaign.model.js
const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: String,
        required: true
    },
    companyUrl: {
        type: String,
        required: true
    },
    documents: [{
        type: String,

    }],
    summary: {
        type: String
    },
    senderAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'running', 'completed', 'stopped'],
        default: 'draft'
    },
    lastRunAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    // langGraphState: Object
}, { timestamps: true });

module.exports = mongoose.model("campaign", CampaignSchema, "campaigns");
