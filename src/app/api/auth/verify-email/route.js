import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import TempUser from "@/model/tempUser";

export async function POST(request) {
    try {
        await dbConnect();

        const { email, verifyCode } = await request.json();

        if (!email || !verifyCode) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Email and verification code are required" 
            }), { status: 400 });
        }

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found or verification code expired" 
            }), { status: 404 });
        }

        if (tempUser.verifyCodeExpires < new Date()) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Verification code has expired" 
            }), { status: 400 });
        }

        if (tempUser.verifyCode !== verifyCode) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid verification code" 
            }), { status: 400 });
        }

        const newUser = new User({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            role: tempUser.role,
            profilePicture: tempUser.profilePicture,
            address: tempUser.address,
            phonenumber: tempUser.phonenumber
        });

        await newUser.save();

        await TempUser.findByIdAndDelete(tempUser._id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Email verified successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in verify-email route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
