import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import os from "os";

import DocumentService from "./documentService.js";

class PDFService {

    static formatDate(dateValue) {
        if (!dateValue) return "";

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return String(dateValue);

        return date.toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

   static calculateDuration(startDate, endDate) {
        if (!startDate || !endDate) return "";

        const start = new Date(startDate);
        const end = new Date(endDate);

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();

        if (end.getDate() < start.getDate()) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        months++;

        const parts = [];

        if (years > 0) {
            parts.push(`${years} year${years > 1 ? "s" : ""}`);
        }

        if (months > 0) {
            parts.push(`${months} month${months > 1 ? "s" : ""}`);
        }

        return parts.join(" ");
    }

    static prepareParticipant(participant) {
        const responsibilities =
            participant.responsibilities ||
            participant.participant_role ||
            "";

        return {
            ...participant,
            full_name: `${participant.first_name || ""} ${participant.last_name || ""}`.trim(),
            start_date: this.formatDate(participant.commencement_date),
            end_date: this.formatDate(participant.termination_date),
            commencement_date: this.formatDate(participant.commencement_date),
            termination_date: this.formatDate(participant.termination_date),
            created_at: this.formatDate(participant.created_at),
            duration_months: this.calculateDuration(
                participant.commencement_date,
                participant.termination_date
            ),
            responsibilities,
            exposure_areas: participant.exposure_areas || ""
        };
    }

    static getChromeExecutablePath() {
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            return process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        const candidates = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        ];

        return candidates.find((candidate) => fs.existsSync(candidate));
    }

    static async launchBrowser() {
        const executablePath = this.getChromeExecutablePath();
        const launchOptions = {
            headless: true,
            args: [
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync",
                "--disable-translate",
                "--hide-scrollbars",
                "--metrics-recording-only",
                "--mute-audio",
                "--no-first-run",
                "--safebrowsing-disable-auto-update",
                // Use a unique user data dir to avoid conflicts: use node temp's dir
                `--user-data-dir=${path.join(os.tmpdir(), "puppeteer_profile_" + Date.now())}`
            ]
        };

        if (executablePath) {
            launchOptions.executablePath = executablePath;
        }

        return puppeteer.launch(launchOptions);
    }

    static fileToDataUrl(relativePath) {
        const absolutePath = path.join(process.cwd(), relativePath);

        if (!fs.existsSync(absolutePath)) {
            console.warn(`File not found: ${absolutePath}`);
            return "";
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        const extension = path.extname(absolutePath).toLowerCase();
        const mimeType = extension === ".png" ? "image/png" : "image/jpeg";

        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    static async createPDF(documentType, participant) {

        let folder;
        let templateFile;

        switch (documentType) {

            case "contract":
                folder = await DocumentService.getContractPdfFolder();
                templateFile = "contract.ejs";
                break;

            case "wil-letter":
                folder = await DocumentService.getWilPdfFolder();
                templateFile = "wil-letter.ejs";
                break;

            default:
                throw new Error("Invalid document type.");
        }

        const templatePath = path.join(
            process.cwd(),
            "server",
            "templates",
            templateFile
        );

        const filename = DocumentService.generateFilename(
            documentType.replace("-", "_"),
            participant.participant_id,
            "pdf"
        );

        const filePath = path.join(folder, filename);
        const preparedParticipant = this.prepareParticipant(participant);
        const cssFilePath = path.join(process.cwd(), "client", "css", "index.css");
        const cssContent = await fsPromises.readFile(cssFilePath, "utf8");

        // Build HTML with embedded CSS (no separate link tag)
        const html = await ejs.renderFile(templatePath, {
            participant: preparedParticipant,
            cssContent: `<style>${cssContent}</style>`,
            logoDataUrl: this.fileToDataUrl(path.join("client", "assets", "logo.png")),
            signatureDataUrl: this.fileToDataUrl(path.join("client", "assets", "signature.png")),
            stampLogoDataUrl: this.fileToDataUrl(path.join("client", "assets", "stamp.png"))
        });

        const browser = await this.launchBrowser();

        try {
            const page = await browser.newPage();

            // Use A4 dimensions in pixels (595 x 842)
            await page.setViewport({
                /*width: 595,
                height: 842,*/
                width: 1280,
                height: 1800,
                deviceScaleFactor: 1
            });

            await page.emulateMediaType("print");
            
            // Set content with wait for all resources
            await page.setContent(html, {
                waitUntil: "domcontentloaded",
                timeout: 15000
            });

            // Wait a bit for styles to apply
            // Wait for images to load (using proper method)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate PDF with proper settings
            await page.pdf({
                path: filePath,
                format: "A4",
                printBackground: true,
                preferCSSPageSize: false,
                margin: {
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0"
                },
                displayHeaderFooter: false,
                landscape: false
            });

            console.log(`PDF generated: ${filename}`);

        } catch (error) {
            console.error(`Error generating PDF:`, error);
            throw error;
        } finally {
            await browser.close();
        }

        return filename;
    }

}

export default PDFService;