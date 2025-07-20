import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: false // Only for item-specific reviews
    },
    type: {
        type: String,
        enum: ['kitchen', 'item'],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    comment: {
        type: String,
        required: true,
        maxLength: 500
    },
    tags: [{
        type: String,
        enum: ['taste', 'quality', 'packaging', 'delivery', 'value', 'freshness', 'quantity', 'service']
    }],
    images: [{
        type: String // URLs to review images
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    helpful: {
        type: Number,
        default: 0
    },
    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sellerResponse: {
        comment: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ sellerId: 1, type: 1, createdAt: -1 });
reviewSchema.index({ menuItemId: 1, rating: -1 });
reviewSchema.index({ customerId: 1, createdAt: -1 });
reviewSchema.index({ orderId: 1 });

// Ensure one review per customer per order per item/kitchen
reviewSchema.index({ customerId: 1, orderId: 1, menuItemId: 1, type: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
