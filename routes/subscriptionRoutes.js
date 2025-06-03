import express from 'express';
import { getSubscriptionStatus } from '../controllers/subscriptionController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.get('/status', getSubscriptionStatus);

export default router;
