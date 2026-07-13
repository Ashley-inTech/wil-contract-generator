import express from 'express';
import fileController from '../controllers/fileController.js';

const router = express.Router();

router.get('/:documentType/:format/:filename', fileController.downloadFile);

export default router;
