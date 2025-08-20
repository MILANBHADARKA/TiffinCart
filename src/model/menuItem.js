import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    kitchenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kitchen',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner'],
        trim: true
    },
    image: {
        type: String, // Cloudinary URL
        default: ''
    },
    imagePublicId: {
        type: String, // Cloudinary public ID for deletion
        default: ''
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    spiciness: {
        type: String,
        enum: ['mild', 'medium', 'hot'],
        default: 'medium'
    },
    // Tiffin delivery schedule
    deliverySchedule: {
        breakfast: {
            startTime: { type: String, default: '07:00' }, // 7:00 AM
            endTime: { type: String, default: '10:00' }    // 10:00 AM
        },
        lunch: {
            startTime: { type: String, default: '12:00' }, // 12:00 PM
            endTime: { type: String, default: '15:00' }    // 3:00 PM
        },
        dinner: {
            startTime: { type: String, default: '19:00' }, // 7:00 PM
            endTime: { type: String, default: '22:00' }    // 10:00 PM
        }
    },
    // Advance order requirement (hours)
    advanceOrderHours: {
        type: Number,
        default: 3 // Customer must order at least 3 hours in advance
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    nutritionInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    allergens: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    orderCount: {
        type: Number,
        default: 0
    },
    // Tiffin specific fields
    servingSize: {
        type: String,
        default: '1 person'
    },
    packaging: {
        type: String,
        default: 'Eco-friendly container'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ kitchenId: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isVeg: 1 });
menuItemSchema.index({ isAvailable: 1 });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;