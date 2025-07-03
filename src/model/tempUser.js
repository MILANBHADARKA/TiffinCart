import mongoose, {Schema} from "mongoose";

const tempUserSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phonenumber: { 
        type: String 
    },
    address: { 
        type: String 
    }, 
    role: { 
        type: String, 
        enum: ["customer", "seller"], 
        required: true 
    },
    profilePicture: {
        type: String,
        default: ""
    },
    verifyCode: {
        type: String,
        required: [true, "Verification code is required!"]
    },
    verifyCodeExpires: {
        type: Date,
        required: [true, "Verification code expiry is required!"]
    }
},{
    timestamps: true
})

export default mongoose.models.TempUser || mongoose.model("TempUser", tempUserSchema);
