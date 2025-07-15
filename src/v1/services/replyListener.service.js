
const axios = require('axios');
const { refreshAccessToken } = require("./email.service")
const emailReplyListener = async ({ accessToken, msgThreadId, yourEmail, account, lastMessageId }) => {
    const fresh_access_token = await refreshAccessToken({ accountId: account._id, refresh_token: account.config.refresh_token });

    const headers = {
        Authorization: `Bearer ${fresh_access_token}`,
        Accept: 'application/json',
    };
    let threadRes;

    threadRes = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${msgThreadId}`,
        { headers }
    );

    const messages = threadRes.data.messages;

    // const newReplies = messages.filter((msg) => {
    //     const from = msg.payload.headers.find((h) => h.name === 'From')?.value || '';
    //     return !from.includes(yourEmail);
    // });
    const lastIndex = messages.findIndex((msg) => msg.id === lastMessageId);

    const newerMessages = lastIndex >= 0 ? messages.slice(lastIndex + 1) : messages;



    const decodedReplies = newerMessages.map((msg) => {
        const payload = msg.payload;
        let body = '';

        if (payload.parts) {
            const part = payload.parts.find((p) => p.mimeType === 'text/plain');
            if (part?.body?.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf8');
            }
        } else if (payload.body?.data) {
            body = Buffer.from(payload.body.data, 'base64').toString('utf8');
        }

        return {
            id: msg.id,
            internalDate: Number(msg.internalDate),
            sender: payload.headers.find((h) => h.name === 'From')?.value || '',
            body: body.trim() || msg.snippet,
        };
    });

    return decodedReplies;
}

module.exports = emailReplyListener;
