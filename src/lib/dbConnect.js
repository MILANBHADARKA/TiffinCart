import mongoose from "mongoose";

async function dbConnect(){
    if (mongoose.connection.readyState >= 1) {
        console.log("Database is already connected");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL || '');
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw new Error("Database connection failed");
    }
}

export default dbConnect;