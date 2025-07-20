import { resend } from "@/lib/resend";
import KitchenApprovedEmail from "../../emails/KitchenApprovedEmail";

export async function kitchenApprovedEmail({ ownerName, ownerEmail, kitchenName, kitchenId }) {
    try {
        // console.log("Sending approval email to:", ownerEmail);
        const { data, error } = await resend.emails.send({
            from: "TifinCart <tifincart@themoneymate.xyz>",
            to: ownerEmail,
            subject: "New Kitchen Approved!",
            react: KitchenApprovedEmail({
                ownerName: String(ownerName),
                kitchenName: String(kitchenName),
                kitchenId: String(kitchenId)
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