import mongoose, {Schema} from "mongoose";

const tempUserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'seller'],
        required: true
    },
    verifyCode: {
        type: String,
        required: true
    },
    verifyCodeExpires: {
        type: Date,
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    phonenumber: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Auto-delete expired temp users
tempUserSchema.index({ verifyCodeExpires: 1 }, { expireAfterSeconds: 0 });

const TempUser = mongoose.models.TempUser || mongoose.model('TempUser', tempUserSchema);

export default TempUser;
