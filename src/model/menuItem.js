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
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert']
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    spiciness: {
        type: String,
        enum: ['mild', 'medium', 'hot'],
        default: 'mild'
    },
    ingredients: [{
        type: String
    }],
    image: {
        type: String,
        default: ''
    },
    servingSize: {
        type: String,
        default: '1 person'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;