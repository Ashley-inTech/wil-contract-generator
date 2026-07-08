import express from'express';
const router = express.Router();

// Import all route files
import participantRoutes from'./participantRoutes.js';
import contractRoutes from'./contractRoutes.js';
import wilLetterRoutes from'./wilLetterRoutes.js';
import careerCategoryRoutes from'./careerCategoryRoutes.js';
import exposureAreaRoutes from './exposureAreaRoutes.js';

// Use routes with prefixes
router.use('/participants', participantRoutes);
router.use('/contracts', contractRoutes);
router.use('/wil-letters', wilLetterRoutes);
router.use('/careers', careerCategoryRoutes);
router.use('/exposures', exposureAreaRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running'
    });
});

export default router;