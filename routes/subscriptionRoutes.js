import express from 'express';
import { createPaymentIntent, handlePaymentSuccess } from '../controllers/paymentController.js';
import { getSubscriptionStatus } from '../controllers/subscriptionController.js';
import { protect } from '../controllers/authController.js';
const router = express.Router();

router.use(protect);

router.get('/status', getSubscriptionStatus);
// Route to create payment intent
router.post('/create-payment-intent', createPaymentIntent);
// Route to handle successful payment and create RevenueCat subscription
router.post('/payment-success', handlePaymentSuccess);

export default router;
