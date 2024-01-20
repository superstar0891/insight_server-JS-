import express from "express";
import * as ChromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

import fs from 'fs';
import path from "path";
import open from "open";
const app = express();


// Endpoint to serve the HTML reports
const __dirname = path.resolve();
app.use('/audit-reports', express.static(path.join(__dirname, 'audit-reports')));

export const submit = async (req, res) => {
    try {
        const url = req.query.url; // Assuming req.query.url is a string

        // Launch Chrome in desktop environment
        const desktopChromeFlags = {
            chromeFlags: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
        };
        const desktopChrome = await ChromeLauncher.launch(desktopChromeFlags);

        // Launch Chrome in mobile environment
        const mobileChromeFlags = {
            chromeFlags: ['--no-sandbox', '--disable-gpu', '--user-agent=Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36']
        };
        const mobileChrome = await ChromeLauncher.launch(mobileChromeFlags);

        // Define options for both desktop and mobile audits
        const lighthouseOptions = [
            {
                formFactor: 'desktop',
                throttling: {
                    cpuSlowdownMultiplier: 1,
                    requestLatency: 0,
                    downloadThroughput: 0,
                    uploadThroughput: 0
                }
            },
            {
                formFactor: 'mobile',
                throttling: {
                    cpuSlowdownMultiplier: 4,
                    requestLatency: 150,
                    downloadThroughput: 1638.4,
                    uploadThroughput: 825.6
                }
            }
        ];

        let audits = [];
        let paths = []

        for (const option of lighthouseOptions) {
            const flags = {
                logLevel: 'info',
                output: 'html',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
                port: option.formFactor === 'desktop' ? desktopChrome.port : mobileChrome.port,
                emulatedFormFactor: option.formFactor,
                throttling: option.throttling
            };

            const runnerResult = await lighthouse(url, flags);
            const reportHtml = runnerResult.report;

            // Save the HTML reports
            const __dirname = path.resolve();
            const reportPath = path.join(__dirname, 'audit-reports');
            fs.mkdirSync(reportPath, { recursive: true });
            const reportFilePath = path.join(reportPath, `lhreport-${option.formFactor}.html`);
            fs.writeFileSync(reportFilePath, reportHtml);
            paths = [...paths, reportFilePath]
            console.log(paths)
            // Store the report path for response
        }
        for (let i = 0; i < paths.length; i++) {
            let data = fs.readFileSync(paths[i], "utf-8");
            audits = [...audits, {
                reportHTML: data
            }];
        }

        desktopChrome.kill();
        mobileChrome.kill();

        res.json(audits);

    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred during the audit.');
    }
};
