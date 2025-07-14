const EmailService = require("../../services/email.service")
const oauthAccountLogin = async (req, res) => {
    try {
        const loginLink = await EmailService.getLoginLink();
        res.status(200).json({ "message": "Account Link", data: loginLink });
    } catch (error) {
        // next(error)
    }
};

const authorization = async (req, res) => {
    try {
        let result = await EmailService.getAutorization(req.body)
        res.status(200).json({
            message: "account authorized successfully",
        });
    } catch (error) {
        // next(error)
    }

}

module.exports = {
    oauthAccountLogin,
    authorization
}