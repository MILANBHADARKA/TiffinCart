import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
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
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: false
    },
    type: {
        type: String,
        enum: ['kitchen', 'item'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique favorites
favoriteSchema.index({ customerId: 1, sellerId: 1, menuItemId: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

export default Favorite;
