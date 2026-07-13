import WilLetterModel from'../models/WilLetterModel.js';
import ParticipantModel from '../models/ParticipantModel.js';
import PDFService from "../services/pdfService.js";
import DOCXService from "../services/docxService.js";
import DocumentService from "../services/documentService.js";

class WilLetterController {

    // Get all WIL letters
    static async getAllWilLetters(req, res) {
        try {
            const letters = await WilLetterModel.getAll();
            res.status(200).json({
                success: true,
                data: letters
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching WIL letters',
                error: error.message
            });
        }
    }

    // Get WIL letters for a participant
    static async getParticipantWilLetters(req, res) {
        try {
            const { participantId } = req.params;
            const letters = await WilLetterModel.getByParticipantId(participantId);
            res.status(200).json({
                success: true,
                data: letters
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching participant WIL letters',
                error: error.message
            });
        }
    }

    // Get a single WIL letter
    static async getWilLetter(req, res) {
        try {
            const { id } = req.params;
            const letter = await WilLetterModel.getById(id);
            
            if (!letter) {
                return res.status(404).json({
                    success: false,
                    message: 'WIL letter not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: letter
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching WIL letter',
                error: error.message
            });
        }
    }

    // Generate a new WIL letter
    static async generateWilLetter(req, res) { 
        console.log("================================");
        console.log("WIL CONTROLLER REACHED");
        console.log("Params:", req.params);
        console.log("Body:", req.body);
        console.log("================================");

        try {
            const { participantId } = req.params;
            console.log("Participant:", participant);
            
            // Check if participant exists
            const participant = await ParticipantModel.getById(participantId);
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            const existingLetter = await WilLetterModel.getLatest(participantId);

            const pdfFilename = await PDFService.createPDF(
                "wil-letter",
                participant
            );

            let docxFilename = null;

            try {
                docxFilename = await DOCXService.createDOCX(
                    "wil-letter",
                    participant
                );
            } catch (docxError) {
                console.warn("WIL letter DOCX generation skipped:", docxError.message);
            }

            let letter;

            if (existingLetter) {
                await WilLetterModel.update(existingLetter.wil_letter_id, {
                    generated_pdf: pdfFilename,
                    generated_docx: docxFilename,
                    status: 'Generated'
                });
                letter = await WilLetterModel.getById(existingLetter.wil_letter_id);
            } else {
                const letterData = {
                    participant_id: participantId,
                    generated_pdf: pdfFilename,
                    generated_docx: docxFilename,
                    status: 'Generated'
                };

                const letterId = await WilLetterModel.create(letterData);
                letter = await WilLetterModel.getById(letterId);
            }
            
            res.status(existingLetter ? 200 : 201).json({
                success: true,
                message: existingLetter
                    ? 'WIL letter regenerated successfully'
                    : 'WIL letter generated successfully',
                data: letter
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error generating WIL letter',
                error: error.message
            });
        }
    }

    // Update a WIL letter
    static async updateWilLetter(req, res) {
        try {
            const { id } = req.params;
            const letterData = req.body;
            
            const updated = await WilLetterModel.update(id, letterData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'WIL letter not found or no changes made'
                });
            }
            
            const updatedLetter = await WilLetterModel.getById(id);
            res.status(200).json({
                success: true,
                message: 'WIL letter updated successfully',
                data: updatedLetter
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating WIL letter',
                error: error.message
            });
        }
    }

    // Update WIL letter status
    static async updateWilLetterStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['Draft', 'Generated', 'Sent'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be Draft, Generated, or Sent'
                });
            }
            
            const updated = await WilLetterModel.updateStatus(id, status);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'WIL letter not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'WIL letter status updated successfully',
                data: { wil_letter_id: id, status }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating WIL letter status',
                error: error.message
            });
        }
    }

    // Delete a WIL letter
    static async deleteWilLetter(req, res) {
        try {
            const { id } = req.params;
            const deleted = await WilLetterModel.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'WIL letter not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'WIL letter deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting WIL letter',
                error: error.message
            });
        }
    }

    static async downloadContractPDF(req, res) {

        try {

            const { participantId } = req.params;

            const letter = await WilLetterModel.getLatest(participantId);

            if (!letter || !letter.generated_pdf) {
                return res.status(404).json({
                    success: false,
                    message: "WIL letter PDF not found."
                });
            }

            const filePath = await DocumentService.getFilePath(
                "wil-letter",
                "pdf",
                letter.generated_pdf
            );

            if (!DocumentService.fileExists(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: "PDF file does not exist."
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

    static async downloadContractDOCX(req, res) {

        try {

            const { participantId } = req.params;

            const letter = await WilLetterModel.getLatest(participantId);

            if (!letter || !letter.generated_docx) {
                return res.status(404).json({
                    success: false,
                    message: "WIL letter DOCX not found."
                });
            }

            const filePath = await DocumentService.getFilePath(
                "wil-letter",
                "docx",
                letter.generated_docx
            );

            if (!DocumentService.fileExists(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: "DOCX file does not exist."
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

export default WilLetterController;