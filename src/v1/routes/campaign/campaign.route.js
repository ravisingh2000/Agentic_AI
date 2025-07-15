const express = require("express");
const router = express.Router();
const multer = require("multer");
const campaignController = require("../../controllers/campaign/campaign.controller")
const upload = multer({
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});
//auth routes

router.post(
    "/createCampaign",
    upload.single("file"),
    campaignController.createCampaign
);


module.exports = router;
