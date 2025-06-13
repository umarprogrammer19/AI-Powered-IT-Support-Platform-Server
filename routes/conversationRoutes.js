import express from 'express';
import { protect } from '../controllers/authController.js';
import { getConversationHistory, handleChat } from '../controllers/conversationController.js';

const router = express.Router();

// Middlware
router.use(protect);
router.post('/ai/chat', handleChat);
router.get('/history/:userId', getConversationHistory);

export default router;
