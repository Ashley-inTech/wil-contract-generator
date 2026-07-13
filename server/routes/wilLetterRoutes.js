import wilLetterController from '../controllers/wilLetterController.js';

import express from 'express';
const router = express.Router();

// Get all WIL letters
router.get('/', wilLetterController.getAllWilLetters);

// Get a single WIL letter
router.get('/:id', wilLetterController.getWilLetter);

// Generate a new WIL letter for a participant
router.post('/participant/:participantId/generate', wilLetterController.generateWilLetter); 

// Get WIL letters for a specific participant
router.get('/participant/:participantId', wilLetterController.getParticipantWilLetters);

// Update a WIL letter
router.put('/:id', wilLetterController.updateWilLetter);

// Update WIL letter status
router.patch('/:id/status', wilLetterController.updateWilLetterStatus);

// Delete a WIL letter
router.delete('/:id', wilLetterController.deleteWilLetter);

//Download contract pdf
router.get('/participant/:participantId/pdf/download', wilLetterController.downloadContractPDF);

//Download contract docx
router.get('/participant/:participantId/docx/download', wilLetterController.downloadContractDOCX);

export default router;