import { resend } from "@/lib/resend";
import KitchenApprovalRequestEmail from "../../emails/KitchenApprovalRequestEmail";

export async function sendKitchenApprovalEmail({ kitchenData, ownerDetails }) { 
    try {
        if (!kitchenData || !ownerDetails) {
            throw new Error('Missing required data for sending kitchen approval email');
        }

        const adminDashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/kitchens`;

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <notifications@themoneymate.xyz>',
            to: [process.env.ADMIN_EMAIL || 'admin@tifincart.com'],
            subject: `🏪 New Kitchen Approval Request: ${kitchenData.name}`,
            react: KitchenApprovalRequestEmail({
                kitchenData,
                ownerDetails,
                adminDashboardUrl
            }),
        });

        if (error) {
            console.error('Error sending kitchen approval email:', error);
            return { success: false, error: error.message };
        }

        console.log('Kitchen approval email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendKitchenApprovalEmail:', error);
        return { success: false, error: error.message };
    }
}
           