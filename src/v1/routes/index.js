const express = require("express");
const AccountRoute = require("./accounts/account.route")

const router = express.Router();

const defaultRoute = [
    { path: "/account", route: AccountRoute }
];

defaultRoute.forEach((link) => {
    router.use(link.path, link.route);
});

module.exports = router;
