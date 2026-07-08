import exposureAreaController from '../controllers/exposureAreaController.js';

import express from 'express';
const router = express.Router(); 

// Get all exposures
router.get('/', exposureAreaController.getAllExposures);

// Get exposures for a specific career
router.get('/career/:careerId', exposureAreaController.getExposuresByCareer);

// Get a single exposure
router.get('/:id', exposureAreaController.getExposure);

// Create a new exposure
router.post('/', exposureAreaController.createExposure);

// Create multiple exposures
router.post('/bulk', exposureAreaController.createMultipleExposures);

// Update an exposure
router.put('/:id', exposureAreaController.updateExposure);

// Delete an exposure
router.delete('/:id', exposureAreaController.deleteExposure);

export default router;