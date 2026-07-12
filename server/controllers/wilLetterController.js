import WilLetterModel from'../models/WilLetterModel.js';
import ParticipantModel from '../models/ParticipantModel.js';

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
        try {
            const { participantId } = req.params;
            
            // Check if participant exists
            const participant = await ParticipantModel.getById(participantId);
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            // Check if WIL letter already exists
            const hasLetter = await WilLetterModel.hasWilLetter(participantId);
            if (hasLetter) {
                return res.status(400).json({
                    success: false,
                    message: 'This participant already has a WIL letter. Use update instead.'
                });
            }
            
            // In a real app, this would generate PDF/DOCX files
            const letterData = {
                participant_id: participantId,
                generated_pdf: `wil_letter_${participantId}_${Date.now()}.pdf`,
                generated_docx: `wil_letter_${participantId}_${Date.now()}.docx`,
                status: 'Generated'
            };
            
            const letterId = await WilLetterModel.create(letterData);
            const newLetter = await WilLetterModel.getById(letterId);
            
            res.status(201).json({
                success: true,
                message: 'WIL letter generated successfully',
                data: newLetter
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

    //download pdf contract
    static async downloadContractPDF(req, res) {

    }

    //download docx contract
    static async downloadContractDOCX(req, res) {
        
    }

}

export default WilLetterController;