import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { setTokenCookie } from "@/lib/cookies";


export async function POST(request){
    try {
        await dbConnect();

        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ success: false, error: "Email and password are required" }), { status: 400 });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ success: false, error: "Invalid password" }), { status: 401 });
        }

        const token = generateToken({ id: user._id, email: user.email, role: user.role });

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: "Failed to generate token" }), { status: 500 });
        }

        const cookie = setTokenCookie(token);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Sign-in successful",
        }), {
            status: 200,
            headers: {
                "Set-Cookie": cookie,
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        console.error("Error in sign-in route:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
    }
}