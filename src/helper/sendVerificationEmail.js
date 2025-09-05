import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendverificationEmail({ to, name, verifyCode }) { 
    try {
        const { data, error } = await resend.emails.send({
            from: "TifinCart <tifincart.otp@themoneymate.xyz>",
            to: to,
            subject: "TifinCart - Email Verification",
            react: VerificationEmail({ name, verifyCode })
        })

        if (error) {
            console.error("Error sending email:", error);
            return {
                success: false,
                error: "Failed to send verification email"
            };
        }

        return {
            success: true,
            message: "Verification email sent successfully",
            data: data
        };

    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            success: false,
            error: "Failed to send verification email"
        };
    }
}