import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    kitchenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kitchen',
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
    image: String,
    isVeg: Boolean
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate cart total
cartSchema.virtual('total').get(function() {
    return this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
});

// Pre-save middleware to update the updatedAt field
cartSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;