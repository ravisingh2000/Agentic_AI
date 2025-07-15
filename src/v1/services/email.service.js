
const axios = require("axios")
const Account = require("../../models/accounts/account.model")
const Campaign = require("../../models/campaign/campaign.model")
const Lead = require("../../models/leads/leads.model")

const setAccount = async (data) => {
    console.log(data)
    let userProfile = await getGoogleUserProfile(data.access_token)
    let account = await Account.findOne({
        type: 'GMAIL',
        config: { access_token: data.access_token }

    });
    const new_account = await Account.create({
        type: 'GMAIL',

        email: userProfile.email,
        config: {
            access_token: data.access_token,
            refresh_token: data.refresh_token
        },
        active: true
    }).lean();

    return new_account
}
const getAccount = async (accountId) => {
    const account = await Accounts.findById(accountId);
    return account
}
const getGoogleUserProfile = async (accessToken) => {
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const { email, name, picture, sub } = response.data;
        return { email, name, picture, googleId: sub };

    } catch (error) {
        console.error('Failed to fetch user profile:', error.response?.data || error.message);
        // throw new Error('Unable to fetch Google user info');
    }
}
const getLoginLink = async () => {
    const authUrl =
        'https://accounts.google.com/o/oauth2/v2/auth' +
        '?access_type=offline' +
        '&response_type=code' +
        `&client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${process.env.GOOGLE_REDIRECT}` +
        '&prompt=consent' +
        '&scope=' + encodeURIComponent([

            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'
        ].join(' '));

    return authUrl
}
const authorization = async (code) => {
    const authCode = code;
    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const redirectUri = process.env.GOOGLE_REDIRECT || 'https://8c49aa241c23.ngrok-free.app/v1/account/authorization/Gmail';

    const basicAuth = Buffer.from(
        `${process.env.GOOGLE_CLIENT_ID}:${process.env.GOOGLE_CLIENT_SECRET}`
    ).toString("base64");

    try {
        const response = await axios.post(
            tokenUrl,
            new URLSearchParams({
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code: authCode
            }),
            {
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );

        const { access_token, refresh_token } = response.data;

        if (access_token) {
            await setAccount({ access_token, refresh_token });
        }

        return this.config;
    } catch (error) {
        console.error('OAuth authorization failed:', error.response?.data || error.message);
        // throw new Error('Failed to authorize with Google');
    }
}
const refreshAccessToken = async ({ accountId, refresh_token }) => {

    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';

    const formParams = new URLSearchParams();
    formParams.append('grant_type', 'refresh_token');
    formParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    formParams.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    formParams.append('refresh_token', refresh_token);

    const response = await axios.post(tokenUrl, formParams.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });

    const tokenResponse = response.data;
    console.log('Refreshed token response:', tokenResponse);


    const account = await Account.findById(accountId);

    if (account && tokenResponse.access_token) {

        account.config.access_token = tokenResponse.access_token;

        await account.save();
    }

    return tokenResponse.access_token;
}

// const sendMail = async ({
//     to, from, subject, text, html, replyTo,
//     accessToken, threadId, messageId, references
// }) => {
const sendMail = async (state) => {
    const { lead, campaignId, stage, sendEmail, initialEmail } = state;
    const replyTo = null;
    const messageId = null;
    const references = null;
    const leadData = await Lead.findById(lead.id);
    const campaignData = await Campaign.findById(campaignId).populate('senderAccount')
    const subject = stage == 'intial_email_generated' ? initialEmail.subject : sendEmail?.subject
    const mainBody = stage == 'intial_email_generated' ? initialEmail.body : sendEmail?.body
    const fresh_access_token = await refreshAccessToken({ accountId: campaignData.senderAccount._id, refresh_token: campaignData.senderAccount.config.refresh_token });
    try {
        const boundary = 'boundary-example';

        const headers = [
            `To: ${leadData.email}`,
            `From: ${'ravisingh.11808322@gmail.com'}`,
            `Subject: ${campaignData.messagethreadId ? `Re: ${subject}` : subject}`,
            replyTo ? `Reply-To: ${'ravisingh.11808322@gmail.com'}` : '',
            messageId ? `In-Reply-To: ${messageId}` : '',
            references ? `References: ${references}` : '',
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            '',
        ].filter(Boolean).join('\n');

        const body = [
            `--${boundary}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            '',
            mainBody || '',

        ].join('\n');

        const rawMessage = `${headers}\n${body}`;

        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const payload = { raw: encodedMessage };
        if (leadData.messagethreadId) payload.threadId = leadData.messagethreadId;

        const response = await axios.post(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${fresh_access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        leadData.messagethreadId = response.data.threadId;

        //emailflow data 
        leadData.emailStatus = 'sent'
        leadData.save()
        return {
            ...state,
            stage: "intial_email_sent",
        };
    } catch (err) {
        console.error('sendMail error:', err.response?.data || err.message);
    }
};

module.exports = {
    setAccount, authorization, getAccount, getGoogleUserProfile, getLoginLink, authorization, refreshAccessToken, sendMail
}