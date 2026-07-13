import CareerCategoryModel from'../models/CareerCategoryModel.js';
import ExposureAreaModel from '../models/ExposureAreaModel.js';

class CareerCategoryController {

    // Get all careers
    static async getAllCareers(req, res) {
        try {
            console.log('📥 getAllCareers called');
            const careers = await CareerCategoryModel.getAll();
            console.log('📤 Sending response with', careers.length, 'careers');
            
            res.status(200).json({
                success: true,
                data: careers
            });
        } catch (error) {
            console.error('❌ Error in getAllCareers:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching careers',
                error: error.message,
                stack: error.stack // Include stack trace for debugging
            });
        }
    }

    // Get a single career with exposures
    static async getCareer(req, res) {
        try {
            const { id } = req.params;
            const career = await CareerCategoryModel.getWithExposures(id);
            
            if (!career) {
                return res.status(404).json({
                    success: false,
                    message: 'Career not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: career
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching career',
                error: error.message
            });
        }
    }

    // Create a new career
    static async createCareer(req, res) {
        try {
            const careerData = req.body; 
            const careerId = await CareerCategoryModel.create(careerData);
            const newCareer = await CareerCategoryModel.getById(careerId);
            
            res.status(201).json({
                success: true,
                message: 'Career created successfully',
                data: newCareer
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating career',
                error: error.message
            });
        }
    }

    // Update a career
    static async updateCareer(req, res) {
        try {
            const { id } = req.params;
            const careerData = req.body;
            
            const updated = await CareerCategoryModel.update(id, careerData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Career not found or no changes made'
                });
            }
            
            const updatedCareer = await CareerCategoryModel.getById(id);
            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: updatedCareer
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating career',
                error: error.message
            });
        }
    }

    // Delete a career
    static async deleteCareer(req, res) {
        try {
            const { id } = req.params;
            const deleted = await CareerCategoryModel.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Career not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Career deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting career',
                error: error.message
            });
        }
    }

}

export default CareerCategoryController;