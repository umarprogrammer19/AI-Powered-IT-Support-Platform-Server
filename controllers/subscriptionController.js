import stripe from 'stripe';
import axios from 'axios';
import Subscription from '../models/subscription.js';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const REVENUECAT_BASE_URL = 'https://api.revenuecat.com/v1/subscribers/';

const stripeClient = stripe(STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be in cents for Stripe (e.g. 1000 = $10)

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: amount,  
            currency: 'usd', // Use your currency code
            metadata: { integration_check: 'accept_a_payment' },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment intent', error: error.message });
    }
};

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId, userId, plan, revenueCatCustomerId } = req.body;

        if (!paymentIntentId || !userId || !plan || !revenueCatCustomerId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Confirm the payment intent with Stripe
        const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment failed' });
        }

        // Send data to RevenueCat to create/update subscription
        const response = await axios.post(
            `${REVENUECAT_BASE_URL}${revenueCatCustomerId}`,
            {
                headers: {
                    Authorization: `Bearer ${REVENUECAT_API_KEY}`,
                },
                data: {
                    plan: plan,         
                    status: 'active',   
                },
            }
        );

        const subscriptionData = response.data;

        // Save the subscription to your database
        const subscription = new Subscription({
            user: userId,
            plan: plan,
            status: 'active',
            revenueCatSubscriptionId: revenueCatCustomerId,
            startDate: subscriptionData.created_at,
            expiryDate: subscriptionData.expiry_date,
            lastPaymentDate: subscriptionData.latest_purchase_date,
        });

        await subscription.save();

        res.status(201).json({ message: 'Payment successful and subscription created', subscription });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment or creating subscription', error: error.message });
    }
};

