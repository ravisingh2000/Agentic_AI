const getBookingTemplate = (name) => {
    return `
      <p>Hi ${name || 'there'},</p>
      <p>Great to hear from you! I'd love to connect. Please book a time that works for you using the link below:</p>
      <p><a href=${process.env.CALENDLY_LINK} >📅 Schedule a Meeting</a></p>
      <p>Looking forward to it!</p>
      <p>– Ravi</p>
    `;
}
module.exports = { getBookingTemplate }