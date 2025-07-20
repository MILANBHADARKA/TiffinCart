import { resend } from "@/lib/resend";
import NewKitchenApprovalEmail from "../../emails/NewKitchenApprovalEmail";
import VerificationEmail from "../../emails/VerificationEmail";

export async function newKitchenApprovalEmail({ adminEmail, kitchenId, kitchenName, kitchenDescription }) {
    try {

        const { data, error } = await resend.emails.send({
            from: "TifinCart <tifincart@themoneymate.xyz>",
            to: adminEmail,
            subject: "New Kitchen Approval Request",
            react: NewKitchenApprovalEmail({
                adminEmail: String(adminEmail),
                kitchenId: String(kitchenId),
                kitchenName: String(kitchenName),
                kitchenDescription: String(kitchenDescription)
            })
        })

        if (error) {
            console.log("Error sending email:", error);
            return {
                success: false,
                error: "Failed to send approval email"
            };
        }

        return {
            success: true,
            message: "Approval email sent successfully",
            data: data
        };

    } catch (error) {
        console.error("Error sending approval email:", error);
        return {
            success: false,
            error: "Failed to send approval email"
        };
    }
}