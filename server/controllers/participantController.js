import ParticipantModel from'../models/ParticipantModel.js';

class ParticipantController {

    static async getAllParticipants(req, res) {
        try {
            const participants = await ParticipantModel.getAll();
            res.status(200).json({
                success: true,
                data: participants
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching participants',
                error: error.message
            });
        }
    }

    static async getFilteredParticipants(req, res) {
        try {
            const filters = {
                status: req.query.status,
                career_id: req.query.career_id,
                search: req.query.search
            };
            
            const participants = await ParticipantModel.getWithFilters(filters);
            res.status(200).json({
                success: true,
                data: participants
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching filtered participants',
                error: error.message
            });
        }
    }

    static async getParticipant(req, res) {
        try {
            const { id } = req.params;
            const participant = await ParticipantModel.getWithDocuments(id);
            
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: participant
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching participant',
                error: error.message
            });
        }
    }

    static async getParticipantByIdNumber(req, res) {
        try {
            const { idNumber } = req.params;
            const participant = await ParticipantModel.getByIdNumber(idNumber);

            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }

            res.status(200).json({
                success: true,
                data: participant
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching participant by ID number',
                error: error.message
            });
        }
    }

    static async createParticipant(req, res) {
        try {
            const participantData = req.body;
            
            // Check if participant already exists
            const existing = await ParticipantModel.getByIdNumber(participantData.id_number);
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Participant with this ID number already exists'
                });
            }
            
            const participantId = await ParticipantModel.create(participantData);
            const newParticipant = await ParticipantModel.getById(participantId);
            
            res.status(201).json({
                success: true,
                message: 'Participant created successfully',
                data: newParticipant
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating participant',
                error: error.message
            });
        }
    }

    static async updateParticipant(req, res) {
        try {
            const { id } = req.params;
            const participantData = req.body;
            
            const updated = await ParticipantModel.update(id, participantData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found or no changes made'
                });
            }
            
            const updatedParticipant = await ParticipantModel.getWithDocuments(id);
            res.status(200).json({
                success: true,
                message: 'Participant updated successfully',
                data: updatedParticipant
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating participant',
                error: error.message
            });
        }
    }

    static async updateParticipantStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['Active', 'Completed', 'Terminated'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be Active, Completed, or Terminated'
                });
            }
            
            const updated = await ParticipantModel.updateStatus(id, status);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Participant status updated successfully',
                data: { participant_id: id, status }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating participant status',
                error: error.message
            });
        }
    }

    static async deleteParticipant(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ParticipantModel.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Participant deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting participant',
                error: error.message
            });
        }
    }

    static async getParticipantStats(req, res) {
        try {
            const stats = await ParticipantModel.getStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    }

}

export default ParticipantController;