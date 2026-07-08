import contractController from '../controllers/contractController.js';

import express from 'express';
const router = express.Router();

// Get all contracts
router.get('/', contractController.getAllContracts);

// Get a single contract
router.get('/:id', contractController.getContract);

// Generate a new contract for a participant
router.post('/participant/:participantId/generate', contractController.generateContract);

// Get contracts for a specific participant
router.get('/participant/:participantId', contractController.getParticipantContracts);

// Update a contract
router.put('/:id', contractController.updateContract);

// Update contract status
router.patch('/:id/status', contractController.updateContractStatus);

// Delete a contract
router.delete('/:id', contractController.deleteContract);

export default router;