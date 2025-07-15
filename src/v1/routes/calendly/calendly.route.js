const express = require("express");
const router = express.Router()
const calendlyController = require("../../controllers/calendly/calendly.controller")

router.get('/createWebhook', calendlyController.createWebhook);
router.get('/deleteWebhook', calendlyController.deleteWebhook)
router.post('/calendlyWebhook', calendlyController.calendlyConfimation)
module.exports = router;