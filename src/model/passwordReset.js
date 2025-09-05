import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    verifyCode: {
        type: String,
        required: true
    },
    verifyCodeExpires: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for automatic cleanup of expired documents
passwordResetSchema.index({ verifyCodeExpires: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
