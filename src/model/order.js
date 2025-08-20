import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    isVeg: Boolean,
    // Add review for individual items
    review: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        timestamp: Date
    }
});

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    kitchenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kitchen',
        required: true
    },
    items: [orderItemSchema],
    deliveryAddress: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    // Kitchen-level review (overall experience)
    kitchenReview: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        timestamp: Date,
        // Review categories
        categories: {
            foodQuality: { type: Number, min: 1, max: 5 },
            packaging: { type: Number, min: 1, max: 5 },
            deliveryTime: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 }
        }
    },
    // Track if reviews are completed
    reviewStatus: {
        itemReviewsCompleted: { type: Boolean, default: false },
        kitchenReviewCompleted: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Add status change to history automatically
orderSchema.pre('save', function(next) {
    const order = this;
    
    // If this is a new order or status has changed
    if (order.isNew || order.isModified('status')) {
        order.statusHistory.push({
            status: order.status,
            timestamp: new Date()
        });
    }
    
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;