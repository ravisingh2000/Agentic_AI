const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        type: {
            type: String,
            enum: ['GMAIL'],
            default: ''
        },
        email: {
            type: String,
            default: ''
        },

        active: {
            type: Boolean,
            default: false
        },

        config: {
            access_token: {
                type: String,
                default: ''
            },

            refresh_token: {
                type: String,
                default: ''
            },
        }

    }, { timestamps: true });

let accountModel = mongoose.model('accountSchema', accountSchema, 'accounts')
module.exports = accountModel