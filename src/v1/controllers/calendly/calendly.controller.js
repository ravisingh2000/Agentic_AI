const CalendlyService = require("../../services/calendly.service")
const createWebhook = async (req, res) => {
    try {
        await CalendlyService.createWebhook();
        res.status(200).json({ "message": "Calendly webhook created" });
    } catch (error) {
        // next(error)
    }
};

const deleteWebhook = async (req, res) => {
    try {

        await CalendlyService.deleteWebhook();
        res.status(200).json({
            message: "Calendly webhook deleted",
        });
    } catch (error) {
        // next(error)
    }

}
const calendlyConfimation = async (req, res) => {
    try {
        console.log(req.body)
        await CalendlyService.calendlyConfimation(req.body);
        res.status(200).json({
            message: "Calendly webhook deleted",
        });
    } catch (error) {
        // next(error)
    }

}

module.exports = {
    createWebhook,
    deleteWebhook,
    calendlyConfimation
}