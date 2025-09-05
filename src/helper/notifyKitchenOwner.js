import { resend } from "@/lib/resend";
import KitchenStatusNotificationEmail from "../../emails/KitchenStatusNotificationEmail";

export async function notifyKitchenOwner({ ownerEmail, ownerName, kitchenName, status, remarks }) {
    try {
        if (!ownerEmail || !ownerName || !kitchenName || !status) {
            throw new Error('Missing required data for sending kitchen status notification');
        }

        const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller/kitchens`;

        const statusTexts = {
            'approved': 'Approved',
            'rejected': 'Not Approved', 
            'suspended': 'Suspended',
            'pending': 'Under Review'
        };

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <notifications@themoneymate.xyz>',
            to: [ownerEmail],
            subject: `Kitchen Status Update: ${kitchenName} - ${statusTexts[status] || 'Updated'}`,
            react: KitchenStatusNotificationEmail({
                ownerName,
                kitchenName,
                status,
                remarks,
                dashboardUrl
            }),
        });

        if (error) {
            console.error('Error sending kitchen status notification email:', error);
            return { success: false, error: error.message };
        }

        console.log('Kitchen status notification email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in notifyKitchenOwner:', error);
        return { success: false, error: error.message };
    }
}
         