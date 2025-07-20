import dbConnect from "@/lib/dbConnect";
import TempUser from "@/model/tempUser";
import { sendverificationEmail } from "@/helper/sendVerificationEmail";

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

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found. Please sign up again." 
            }), { status: 404 });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        tempUser.verifyCode = verifyCode;
        tempUser.verifyCodeExpires = verifyCodeExpires;
        await tempUser.save();

        const emailSent = await sendverificationEmail({
            to: email,
            name: tempUser.name,
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
            message: "Verification code sent successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in resend-verification route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
