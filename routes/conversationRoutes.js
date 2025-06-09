import express from 'express';
import { saveConversation, getConversation } from '../controllers/conversationController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Middlware
router.use(protect);

router.post('/', saveConversation);
router.get('/', getConversation);

export default router;
