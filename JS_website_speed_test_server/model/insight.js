import express from "express";
import * as ChromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import fs from 'fs';
import path from "path";
import open from "open";
const app = express();

export const submit = async (req, res) => {
    try {
        const url = req.query.url; // Assuming req.query.url is a string
        console.log(url);
        const chrome = await ChromeLauncher.launch({
            chromeFlags: ['--no-sandbox --headless --disable-gpu']
        });
        const options = {
            logLevel: 'info',
            output: 'html',
            onlyCategories: ['performance'],
            // onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
            port: chrome.port,
        };
        const runnerResult = await lighthouse(url, options);

        // Save the HTML report
        const reportHtml = runnerResult.report;
        const reportFileName = 'lhreport.html';
        const __dirname = path.resolve();
        const reportFilePath = path.join(__dirname, reportFileName);
        console.log("reportFilePath", reportFilePath)
        fs.writeFileSync(reportFilePath, reportHtml);
        chrome.kill();

        res.sendFile(reportFilePath); // Send the HTML report file as a response

        // `.lhr` is the Lighthouse Result as a JS object
        console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
        console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);

        // Open the report in the default web browser
        // open('lhreport.html');
    } catch (error) {
        console.log(error)
    }
};
