import mongoose, { Schema } from "mongoose";

const tifinSchema = new Schema({
    name: {
        type: String,
        required: [true, "Tifin name is required!"]
    },
    description: {
        type: String,
        required: [true, "Tifin description is required!"]
    },
    menuItems: {
        type: [String],
        default: []
    }, // (roti, dal, sabzi, etc.)
    category: {
        type: String,
        enum: ["Lunch", "Dinner", "Breakfast", "Snacks"],
        required: true
    },
    menuType: {
        type: String,
        enum: ["Veg", "Non-Veg"],
        required: true
    },
    price: {
        type: Number,
        required: [true, "Tifin price is required!"]
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    photos: [{
        type: String,
        required: [true, "At least one photo is required!"]
    }],
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Seller ID is required!"]
    },
    openingTime: {
        type: String,
        required: [true, "Opening time is required!"]
    },
    closingTime: {
        type: String,
        required: [true, "Closing time is required!"]
    }
}, {
    timestamps: true
});


export default mongoose.models.Tifin || mongoose.model("Tifin", tifinSchema);