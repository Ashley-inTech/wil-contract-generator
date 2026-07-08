import careerCategoryController from '../controllers/careerCategoryController.js';

import express from 'express';
const router = express.Router(); 

// Get all careers
router.get('/', careerCategoryController.getAllCareers);

// Get a single career (with exposures)
router.get('/:id', careerCategoryController.getCareer);

// Create a new career
router.post('/', careerCategoryController.createCareer);

// Update a career
router.put('/:id', careerCategoryController.updateCareer);

// Delete a career
router.delete('/:id', careerCategoryController.deleteCareer);

export default router;