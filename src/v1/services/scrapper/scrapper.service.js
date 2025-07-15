const { generateWithGemini } = require("../aiService");
const cheerio = require("cheerio");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Campaign = require("../../../models/campaign/campaign.model")
// currently supports crawling a single URL — multi-link crawling from a base URL will be implemented soon
const extractTextFromWebsite = async (url) => {
    const response = await fetch(url);
    const data = await response.text();

    const $ = cheerio.load(data);
    const text = $('body')
        .find('*')
        .contents()
        .filter(function () {
            return this.type === 'text';
        })
        .text();

    return text.replace(/\s+/g, ' ').trim();
}

// support for react and angualr website will be added soon
// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goto("https://example.com");

//   const html = await page.content(); 
//   await browser.close();

//   // Now pass html to Cheerio or htmlparser2
// })();

const extractTextFromFile = async (files) => {
    const mimeType = files.mimetype;
    const dataBuffer = files.buffer;

    if (mimeType === "application/pdf") {
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
    }

    else if (mimeType === "text/plain" || mimeType === "application/octet-stream") {
        const result = dataBuffer.toString("utf8");
        return result;
    }

    else if (
        mimeType === "application/msword" ||
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const result = (await mammoth.extractRawText({ dataBuffer })).value;
        return result;
    }

    throw new Error(`Unsupported file type: `);
}

const summarizeCompanyAndDocument = async (state) => {
    const { campaignId, lead, fileData } = state;
    console.log('🌐 Fetching website data...');
    const campaign = await Campaign.findById(campaignId)
    const companyText = await extractTextFromWebsite(campaign.companyUrl);
    const promptText = `
  You're a sales assistant. Create a concise outreach summary using:
  
  Company overview:
  ${companyText}
  
  Supporting PDF:
  ${fileData}
  
  Produce a short, impactful summary (3–5 sentences) including:
  - What the company does
  - Key offerings
  - Unique value points
  - An attention-grabbing opener for outreach
  `;



    const summary = await generateWithGemini(promptText)
    campaign.summary = summary;
    campaign.save()

    return { ...state, summary, stage: "company_summary_generated", };
}
module.exports = {
    summarizeCompanyAndDocument,
    extractTextFromFile

};
