import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import TempUser from "@/model/tempUser";
import bcrypt from "bcryptjs";
import { sendverificationEmail } from "@/helper/sendVerificationEmail";

export async function POST(request) {

    try {
        await dbConnect();

        const {
            name,
            email,
            password,
            role
        } = await request.json();

        if (!name || !email || !password || !role) {
            return new Response(JSON.stringify({ success: false, error: "All fields are required" }), { status: 400 });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, error: "User already exists!!" }), { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const existingTempUser = await TempUser.findOne({ email: email });

        if (existingTempUser) {
            await TempUser.findByIdAndDelete(existingTempUser._id);
        }

        const tempUser = new TempUser({
            name,
            email,
            password: hashedPassword,
            role,
            verifyCode,
            verifyCodeExpires,
            profilePicture: "",
            address: "",
            phonenumber: ""
        });
        await tempUser.save();

        if(!tempUser) {
            return new Response(JSON.stringify({ success: false, error: "Failed to create temporary user" }), { status: 500 });
        }

        const emailSent = await sendverificationEmail({
            to: email,
            name: name,
            verifyCode: verifyCode
        });

        if (!emailSent.success) {
            return new Response(JSON.stringify({ success: false, error: emailSent.error }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, message: "Verification email sent successfully" }), { status: 200 });

    }
    catch (error) {
        console.error("Error connecting to the database:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });

    }

}