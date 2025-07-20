import mongoose, { Schema } from "mongoose";



const feedbackSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    tifinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tifin',
        required: [true, "Tifin ID is required!"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required!"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"]
    },
    comment: {
        type: String
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, "Order ID is required!"]
    }
}, {
    timestamps: true
});

export default mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);