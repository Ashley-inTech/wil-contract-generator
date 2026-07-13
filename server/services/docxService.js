import ejs from "ejs";
import fs from "fs/promises";
import path from "path";
import { Document, ImageRun, Packer, Paragraph } from "docx";

import PDFService from "./pdfService.js";
import DocumentService from "./documentService.js";

class DOCXService {

    static async createDOCX(documentType, participant) {
        let folder;
        let templateFile;

        switch (documentType) {
            case "contract":
                folder = await DocumentService.getContractDocxFolder();
                templateFile = "contract.ejs";
                break;

            case "wil-letter":
                folder = await DocumentService.getWilDocxFolder();
                templateFile = "will-letter.ejs";
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
            "docx"
        );

        const filePath = path.join(folder, filename);
        const preparedParticipant = PDFService.prepareParticipant(participant);
        const cssFilePath = path.join(process.cwd(), "client", "css", "index.css");
        const cssContent = await fs.readFile(cssFilePath, "utf8");

        const html = await ejs.renderFile(templatePath, {
            participant: preparedParticipant,
            cssContent,
            logoDataUrl: PDFService.fileToDataUrl(path.join("client", "assets", "logo.png")),
            signatureDataUrl: PDFService.fileToDataUrl(path.join("client", "assets", "signature.png"))
        });

        const browser = await PDFService.launchBrowser();

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1200, height: 1600 });
            await page.emulateMediaType("print");
            await page.setContent(html, { waitUntil: "domcontentloaded" });
            await page.addStyleTag({ content: cssContent });

            const pageElements = await page.$$(".page");

            if (!pageElements.length) {
                throw new Error("No document pages were found for DOCX generation.");
            }

            const pageImages = [];

            for (const pageElement of pageElements) {
                const imageBuffer = await pageElement.screenshot({
                    type: "png"
                });

                pageImages.push(imageBuffer);
            }

            const doc = new Document({
                sections: [{
                    children: pageImages.map((imageBuffer, index) => new Paragraph({
                        children: [
                            new ImageRun({
                                data: imageBuffer,
                                transformation: {
                                    width: 550,
                                    height: 780
                                },
                                type: "png"
                            })
                        ],
                        pageBreakBefore: index > 0
                    }))
                }]
            });

            const docBuffer = await Packer.toBuffer(doc);
            await fs.writeFile(filePath, docBuffer);
        } finally {
            await browser.close();
        }

        return filename;
    }

}

export default DOCXService;
