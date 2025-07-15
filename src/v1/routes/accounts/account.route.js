const express = require("express");
const router = express.Router()
const accountController = require("../../controllers/accounts/accounts.controller")

router.get('/getAccountLink', accountController.oauthAccountLogin);
router.get('/authorization/:type', accountController.authorization)

module.exports = router;