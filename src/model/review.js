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
    
    // Kitchen review
    kitchenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kitchen'
    },
    kitchenReview: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        categories: {
            foodQuality: { type: Number, min: 1, max: 5 },
            packaging: { type: Number, min: 1, max: 5 },
            deliveryTime: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 }
        }
    },
    
    // Menu item reviews
    itemReviews: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        itemName: String,
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: String,
        categories: {
            taste: { type: Number, min: 1, max: 5 },
            freshness: { type: Number, min: 1, max: 5 },
            portion: { type: Number, min: 1, max: 5 },
            spiceLevel: { type: Number, min: 1, max: 5 }
        }
    }],
    
    // Review metadata
    isVerified: { type: Boolean, default: true }, // Since it's from actual orders
    isHelpful: { type: Number, default: 0 }, // Helpful votes from other users
    sellerResponse: {
        message: String,
        timestamp: Date
    }
    
}, {
    timestamps: true
});

// Ensure one review per customer per order
reviewSchema.index({ customerId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
