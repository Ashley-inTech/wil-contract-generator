import DocumentService from '../services/documentService.js';

class FileController {

    static async downloadFile(req, res) {
        try {
            const { documentType, format, filename } = req.params;

            const filePath = await DocumentService.getFilePath(
                documentType,
                format,
                filename
            );

            if (!DocumentService.fileExists(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found.'
                });
            }

            return res.download(filePath);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
}

export default FileController;
