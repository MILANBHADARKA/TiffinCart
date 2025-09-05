import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import PasswordReset from "@/model/passwordReset";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await dbConnect();

        const { email, verifyCode, newPassword } = await request.json();

        if (!email || !verifyCode || !newPassword) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Email, verification code, and new password are required" 
            }), { status: 400 });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Password must be at least 6 characters long" 
            }), { status: 400 });
        }

        // Find password reset request
        const passwordReset = await PasswordReset.findOne({ 
            email: email.toLowerCase(),
            isUsed: false
        });

        if (!passwordReset) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid or expired password reset request" 
            }), { status: 404 });
        }

        // Check if code has expired
        if (passwordReset.verifyCodeExpires < new Date()) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Verification code has expired" 
            }), { status: 400 });
        }

        // Verify the code
        if (passwordReset.verifyCode !== verifyCode) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid verification code" 
            }), { status: 400 });
        }

        // Find user and update password
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        // Mark password reset as used
        passwordReset.isUsed = true;
        await passwordReset.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Password reset successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in reset-password route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
