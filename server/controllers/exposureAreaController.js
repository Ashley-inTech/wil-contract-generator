import ExposureAreaModel from'../models/ExposureAreaModel.js';

class ExposureAreaController {

    // Get all exposures
    static async getAllExposures(req, res) {
        try {
            const exposures = await ExposureAreaModel.getAll();
            res.status(200).json({
                success: true,
                data: exposures
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching exposures',
                error: error.message
            });
        }
    }

    // Get exposures for a career
    static async getExposuresByCareer(req, res) {
        try {
            const { careerId } = req.params;
            const exposures = await ExposureAreaModel.getByCareerId(careerId);
            res.status(200).json({
                success: true,
                data: exposures
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching exposures',
                error: error.message
            });
        }
    }

    // Get a single exposure
    static async getExposure(req, res) {
        try {
            const { id } = req.params;
            const exposure = await ExposureAreaModel.getById(id);
            
            if (!exposure) {
                return res.status(404).json({
                    success: false,
                    message: 'Exposure area not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: exposure
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching exposure',
                error: error.message
            });
        }
    }

    // Create a new exposure
    static async createExposure(req, res) {
        try {
            const exposureData = req.body;
            const exposureId = await ExposureAreaModel.create(exposureData); 
            const newExposure = await ExposureAreaModel.getById(exposureId);
            
            res.status(201).json({
                success: true,
                message: 'Exposure area created successfully',
                data: newExposure
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating exposure',
                error: error.message
            });
        }
    }

    // Create multiple exposures
    static async createMultipleExposures(req, res) {
        try {
            const { careerId, exposures } = req.body;
            
            if (!careerId || !exposures || !Array.isArray(exposures)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide careerId and an array of exposures'
                });
            }
            
            const result = await ExposureAreaModel.createMany(careerId, exposures);
            const newExposures = await ExposureAreaModel.getByCareerId(careerId);
            
            res.status(201).json({
                success: true,
                message: 'Exposure areas created successfully',
                data: newExposures
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating exposures',
                error: error.message
            });
        }
    }

    // Update an exposure
    static async updateExposure(req, res) {
        try {
            const { id } = req.params;
            const exposureData = req.body;
            
            const updated = await ExposureAreaModel.update(id, exposureData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Exposure area not found or no changes made'
                });
            }
            
            const updatedExposure = await ExposureAreaModel.getById(id);
            res.status(200).json({
                success: true,
                message: 'Exposure area updated successfully',
                data: updatedExposure
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating exposure',
                error: error.message
            });
        }
    }

    // Delete an exposure
    static async deleteExposure(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ExposureAreaModel.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Exposure area not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Exposure area deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting exposure',
                error: error.message
            });
        }
    }

}

export default ExposureAreaController;

