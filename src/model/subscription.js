import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    features: {
        maxKitchens: {
            type: Number,
            default: 1
        },
        maxMenuItemsPerKitchen: {
            type: Number,
            default: 3
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        analyticsAccess: {
            type: Boolean,
            default: false
        },
        customization: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: String,
    razorpayPlanId: String // For recurring payments
}, {
    timestamps: true
});

const sellerSubscriptionSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'pending'],
        default: 'pending'
    },
    activatedAt: {
        type: Date
    },
    razorpaySubscriptionId: String,
    paymentDetails: {
        razorpayPaymentId: String,
        razorpayOrderId: String,
        razorpaySignature: String,
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    }
}, {
    timestamps: true
});

// Check if subscription is currently active
sellerSubscriptionSchema.methods.isActive = function() {
    return this.status === 'active';
};

// Get current subscription limits
sellerSubscriptionSchema.virtual('currentLimits').get(function() {
    if (this.isActive()) {
        return this.planId.features;
    }
    // Default free plan limits
    return {
        maxKitchens: 1,
        maxMenuItemsPerKitchen: 3,
        prioritySupport: false,
        analyticsAccess: false,
        customization: false
    };
});

const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const SellerSubscription = mongoose.models.SellerSubscription || mongoose.model('SellerSubscription', sellerSubscriptionSchema);

export { SubscriptionPlan, SellerSubscription };
    