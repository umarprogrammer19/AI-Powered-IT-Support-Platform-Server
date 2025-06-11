import Subscription from '../models/subscription.js';

// Get current user subscription status (use revenue cat later)
export const getSubscriptionStatus = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.userId }).sort({ startDate: -1 });
        if (!subscription) return res.json({ active: false, plan: 'free' });

        res.json({
            active: subscription.status === 'active',
            plan: subscription.plan,
            expiryDate: subscription.expiryDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
