import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";

import DocumentService from "./documentService.js";

class PDFService {

    static async createPDF(documentType, participant) {

        let folder;
        let templatePath;

        switch (documentType) {

            case "contract":

                folder = await DocumentService.getContractPdfFolder();

                templatePath = path.join(
                    process.cwd(),
                    "server",
                    "templates",
                    "contract.ejs"
                );

                break;

            case "wil-letter":

                folder = await DocumentService.getWilPdfFolder();

                templatePath = path.join(
                    process.cwd(),
                    "server",
                    "templates",
                    "wil-letter.ejs"
                );

                break;

            default:
                throw new Error("Invalid document type.");
        }

        const filename = DocumentService.generateFilename(
            documentType.replace("-", "_"),
            participant.participant_id,
            "pdf"
        );

        const filePath = path.join(folder, filename);

        const html = await ejs.renderFile(templatePath, {

            participant,

            cssPath:
                "file://" +
                path.join(process.cwd(),
                "client",
                "css",
                "index.css"),

            logoPath:
                "file://" +
                path.join(process.cwd(),
                "client",
                "assets",
                "logo.png"),

            signaturePath:
                "file://" +
                path.join(process.cwd(),
                "client",
                "assets",
                "signature.png")

        });

        const browser = await puppeteer.launch({

            headless: true

        });

        const page = await browser.newPage();

        await page.setContent(html, {

            waitUntil: "networkidle0"

        });

        await page.pdf({

            path: filePath,

            format: "A4",

            printBackground: true,

            margin: {

                top: "15mm",
                right: "15mm",
                bottom: "15mm",
                left: "15mm"

            }

        });

        await browser.close();

        return filename;

    }

}

export default PDFService;