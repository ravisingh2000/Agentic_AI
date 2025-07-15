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
        let result = await EmailService.authorization(req.query.code)
        res.status(200).json({
            message: "account authorized successfully",
        });
    } catch (error) {
        // next(error)
    }

}
// const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;

// const accounts = await Account.find()
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .sort({ createdAt: -1 });

// const total = await Account.countDocuments();

// res.json({
//     accounts,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
// });

module.exports = {
    oauthAccountLogin,
    authorization
}