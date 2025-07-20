import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'snack', 'breakfast', 'lunch', 'dinner']
    },
    cuisine: {
        type: String,
        default: 'indian'
    },
    isVegetarian: {
        type: Boolean,
        default: true
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    spiceLevel: {
        type: String,
        enum: ['mild', 'medium', 'hot', 'very_hot'],
        default: 'medium'
    },
    preparationTime: {
        type: Number,
        required: true,
        min: 5
    },
    ingredients: [{
        type: String
    }],
    allergens: [{
        type: String
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fat: Number,
        fiber: Number
    },
    images: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    availableQuantity: {
        type: Number,
        default: 100
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ sellerId: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
