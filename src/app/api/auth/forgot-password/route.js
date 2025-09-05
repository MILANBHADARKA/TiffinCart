import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import PasswordReset from "@/model/passwordReset";
import { sendForgotPasswordEmail } from "@/helper/sendForgotPasswordEmail";

export async function POST(request) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Email is required" 
            }), { status: 400 });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "No account found with this email address" 
            }), { status: 404 });
        }

        // Generate verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Remove any existing password reset requests for this email
        await PasswordReset.deleteMany({ email: email.toLowerCase() });

        // Create new password reset request
        const passwordReset = new PasswordReset({
            email: email.toLowerCase(),
            verifyCode,
            verifyCodeExpires
        });

        await passwordReset.save();

        // Send email
        const emailSent = await sendForgotPasswordEmail({
            to: email,
            name: user.name,
            verifyCode: verifyCode
        });

        if (!emailSent.success) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: emailSent.error 
            }), { status: 500 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Password reset code sent to your email" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in forgot-password route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
