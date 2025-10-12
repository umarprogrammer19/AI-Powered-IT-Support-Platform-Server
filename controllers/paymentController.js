import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripeClient = Stripe(STRIPE_SECRET_KEY);

// For Creating a payment intent for stripe 
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: { integration_check: 'accept_a_payment' },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment intent', error: error.message });
    }
};

// For Handling Payment 
export const handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId, userId, plan } = req.body;

        if (!paymentIntentId || !userId || !plan) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Confirm the payment intent with Stripe
        const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // Save the subscription to your database (without RevenueCat)
        const subscription = new Subscription({
            user: userId,
            plan: plan,
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Assuming 1 month subscription
            lastPaymentDate: new Date().toISOString(),
        });

        await subscription.save();

        res.status(201).json({ message: 'Payment successful and subscription created', subscription });
    } catch (error) {
        console.error('Error processing payment or creating subscription:', error);
        res.status(500).json({ message: 'Error processing payment or creating subscription', error: error.message });
    }
};
