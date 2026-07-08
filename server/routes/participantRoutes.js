import participantController from '../controllers/participantController.js';

import express from 'express';
const router = express.Router();

// Get all participants (with optional filters)
router.get('/', participantController.getAllParticipants);

// Get filtered participants
router.get('/filter', participantController.getFilteredParticipants);

// Get participant statistics
router.get('/stats', participantController.getParticipantStats);

// Get a single participant
router.get('/:id', participantController.getParticipant);

// Create a new participant
router.post('/', participantController.createParticipant);

// Update a participant
router.put('/:id', participantController.updateParticipant);

// Update participant status
router.patch('/:id/status', participantController.updateParticipantStatus);

// Delete a participant
router.delete('/:id', participantController.deleteParticipant);

export default router;