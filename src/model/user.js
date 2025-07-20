import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
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
    phonenumber: { 
        type: String,
        default: ""
    },
    address: {
        street: { 
            type: String, 
            default: "" 
        },
        city: { 
            type: String, 
            default: "" 
        },
        state: { 
            type: String, 
            default: "" 
        },
        zipCode: { 
            type: String, 
            default: "" 
        }
    },
    role: { 
        type: String, 
        enum: ["customer", "seller"], 
        required: true 
    },
    profilePicture: {
        type: String,
        default: ""
    }
},{
    timestamps: true
})

export default mongoose.models.User || mongoose.model("User", userSchema);
