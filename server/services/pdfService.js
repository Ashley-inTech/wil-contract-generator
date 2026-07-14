import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";

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
                "--disable-gpu"
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
            signatureDataUrl: this.fileToDataUrl(path.join("client", "assets", "signature.png"))
        });

        const browser = await this.launchBrowser();

        try {
            const page = await browser.newPage();

            // Use A4 dimensions in pixels (595 x 842)
            await page.setViewport({
                width: 595,
                height: 842,
                deviceScaleFactor: 1
            });

            await page.emulateMediaType("print");
            
            // Set content with wait for all resources
            await page.setContent(html, {
                waitUntil: "networkidle0"
            });

            // Generate PDF with proper settings
            await page.pdf({
                path: filePath,
                format: "A4",
                printBackground: true,
                preferCSSPageSize: true,
                margin: {
                    top: "15mm",
                    right: "15mm",
                    bottom: "15mm",
                    left: "15mm"
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