
const campaignService = require("../../services/campaign.service")
const createCampaign = async (req, res) => {
    try {
        const campaign = await campaignService.createCampaign(req.body, req.file);
        res.status(200).json({ "message": "Campaign created succesully", });
    } catch (error) {
        // next(error)
    }
};
module.exports = {
    createCampaign
}


