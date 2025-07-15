const express = require("express");
const AccountRoute = require("./accounts/account.route")
const CalendlyRoute = require("./calendly/calendly.route")
const CampaignRoute = require("./campaign/campaign.route")
const router = express.Router();

const defaultRoute = [
    { path: "/account", route: AccountRoute },
    { path: "/calendly", route: CalendlyRoute },
    { path: "/campaign", route: CampaignRoute }
];

defaultRoute.forEach((link) => {
    router.use(link.path, link.route);
});

module.exports = router;
