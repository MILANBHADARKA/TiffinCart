import { resend } from "@/lib/resend";
import ForgotPasswordEmail from "../../emails/ForgotPasswordEmail";

export async function sendForgotPasswordEmail({ to, name, verifyCode }) { 
    try {
        const { data, error } = await resend.emails.send({
            from: "TifinCart <password-reset@themoneymate.xyz>",
            to: to,
            subject: "TifinCart - Password Reset Verification Code",
            react: ForgotPasswordEmail({ name, verifyCode })
        });

        if (error) {
            console.error("Error sending forgot password email:", error);
            return {
                success: false,
                error: "Failed to send password reset email"
            };
        }

        return {
            success: true,
            message: "Password reset email sent successfully",
            data: data
        };

    } catch (error) {
        console.error("Error sending forgot password email:", error);
        return {
            success: false,
            error: "Failed to send password reset email"
        };
    }
}
