import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

class DocumentService {

    // Root uploads folder
    static uploadsFolder = path.join(process.cwd(), 'server', 'uploads');

    // -------------------------
    // Create directory if missing
    // -------------------------
    static async ensureDirectory(directory) {
        try {
            await fs.mkdir(directory, { recursive: true });
            return directory;
        } catch (error) {
            throw new Error(`Unable to create directory: ${error.message}`);
        }
    }

    // -------------------------
    // Generate unique filename
    // -------------------------
    static generateFilename(type, participantId, extension) {

        const timestamp = Date.now();

        return `${type}_${participantId}_${timestamp}.${extension}`;
    }

    // -------------------------
    // CONTRACT PDF
    // -------------------------
    static async getContractPdfFolder() {

        const folder = path.join(
            this.uploadsFolder,
            'contracts',
            'pdf'
        );

        await this.ensureDirectory(folder);

        return folder;
    }

    // -------------------------
    // CONTRACT DOCX
    // -------------------------
    static async getContractDocxFolder() {

        const folder = path.join(
            this.uploadsFolder,
            'contracts',
            'docx'
        );

        await this.ensureDirectory(folder);

        return folder;
    }

    // -------------------------
    // WIL PDF
    // -------------------------
    static async getWilPdfFolder() {

        const folder = path.join(
            this.uploadsFolder,
            'wil-letters',
            'pdf'
        );

        await this.ensureDirectory(folder);

        return folder;
    }

    // -------------------------
    // WIL DOCX
    // -------------------------
    static async getWilDocxFolder() {

        const folder = path.join(
            this.uploadsFolder,
            'wil-letters',
            'docx'
        );

        await this.ensureDirectory(folder);

        return folder;
    }

    // -------------------------
    // Build complete filepath
    // -------------------------
    static async getFilePath(documentType, format, filename) {

        let folder;

        switch (`${documentType}-${format}`) {

            case 'contract-pdf':
                folder = await this.getContractPdfFolder();
                break;

            case 'contract-docx':
                folder = await this.getContractDocxFolder();
                break;

            case 'wil-letter-pdf':
                folder = await this.getWilPdfFolder();
                break;

            case 'wil-letter-docx':
                folder = await this.getWilDocxFolder();
                break;

            default:
                throw new Error('Invalid document type.');
        }

        return path.join(folder, filename);
    }

    // -------------------------
    // File exists?
    // -------------------------
    static fileExists(filePath) {
        return fsSync.existsSync(filePath);
    }

    // -------------------------
    // Delete file
    // -------------------------
    static async deleteFile(filePath) {

        if (this.fileExists(filePath)) {
            await fs.unlink(filePath);
        }

        return true;
    }

}

export default DocumentService;