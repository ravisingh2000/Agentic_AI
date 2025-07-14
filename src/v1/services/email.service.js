
const axios = require("axios")
const Accounts = require("../../models/accounts/account.model")


const setAccount = async (data) => {
    console.log(data)
    let userProfile = await getGoogleUserProfile(data.access_token)
    let account = await Accounts.findOne({
        type: 'GMAIL',
        config: { access_token: data.access_token }

    });

    account.type = 'GMAIL';
    account.email = userProfile.email;
    account.access_token = data.access_token;
    account.refresh_token = data.refresh_token;
    account.active = true;
    const new_account = await account.save();
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
    return 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.compose&response_type=code&client_id=' + process.env.GOOGLE_CLIENT_ID + '&redirect_uri=' + process.env.GOOGLE_REDIRECT + '&flowName=GeneralOAuthFlow&prompt=consent'
}
const authorization = async (code) => {
    const authCode = code.authcode;
    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const redirectUri = process.env.GOOGLE_REDIRECT || 'http://127.0.0.1:3000/v1/integration/getAuthorization/Gmail';

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
const refreshAccessToken = async ({ accountId, access_token, refresh_token }) => {

    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const formParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
    });

    const response = await request.postAsync({
        method: 'POST',
        uri: `${tokenUrl}?${formParams.toString()}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });

    const tokenResponse = JSON.parse(response.body);
    console.log('Refreshed token response:', tokenResponse);


    const account = await Accounts.findOne({
        company: companyId,
        type: 'GMAIL',
        access_token: access_token,
    });

    if (account && tokenResponse.access_token) {

        account.access_token = tokenResponse.access_token;
        account.refresh_token = tokenResponse.refresh_token || account.refresh_token;

        await account.save();
    }

    return;
}

const sendMail = async ({ to, from, subject, text, html, replyTo, accessToken }) => {
    try {
        const rawMessage = [
            `To: ${to}`,
            `From: ${from}`,
            `Subject: ${subject}`,
            replyTo ? `Reply-To: ${replyTo}` : '',
            `Content-Type: multipart/alternative; boundary="boundary-example"`,
            ``,
            `--boundary-example`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            `${text || ''}`,
            `--boundary-example`,
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            `${html || ''}`,
            `--boundary-example--`,
        ]
            .filter(Boolean) // remove empty lines
            .join('\n')
            .trim();

        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // URL-safe base64

        const response = await axios.post(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            { raw: encodedMessage },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Failed to send email:', error.response?.data || error.message);
        // throw new Error('Email sending failed');
    }
}

const replyToMessage = async ({ to, from, subject, text, html, accessToken, threadId, messageId }) => {
    try {
        const boundary = 'boundary-example';

        const rawMessage = [
            `To: ${to}`,
            `From: ${from}`,
            `Subject: Re: ${subject}`,
            `In-Reply-To: ${messageId}`,
            `References: ${messageId}`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            `${text || ''}`,
            `--${boundary}`,
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            `${html || ''}`,
            `--${boundary}--`,
        ]
            .filter(Boolean)
            .join('\n')
            .trim();

        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // base64url encoding

        const response = await axios.post(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
                raw: encodedMessage,
                threadId: threadId,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Failed to reply:', error.response?.data || error.message);
        // throw new Error('Reply failed');
    }
}
module.exports = {
    setAccount, getAccount, getGoogleUserProfile, getLoginLink, authorization, refreshAccessToken, sendMail, replyToMessage
}