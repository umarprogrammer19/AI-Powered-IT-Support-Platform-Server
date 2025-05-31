import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        required: true
    }, // e.g. free, premium, pro
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    revenueCatSubscriptionId: {
        type: String
    }, // To track RevenueCat subscription
    lastPaymentDate: {
        type: Date
    }
});

export default mongoose.model('Subscription', subscriptionSchema);
