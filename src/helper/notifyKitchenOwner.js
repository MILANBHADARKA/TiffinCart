import { resend } from "@/lib/resend";

export async function notifyKitchenOwner({ ownerEmail, ownerName, kitchenName, status, remarks }) {
    try {
        const statusText = status === 'approved' ? 'approved' : 'not approved';
        const statusColor = status === 'approved' ? '#22c55e' : '#ef4444';
        
        const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #f97316; margin: 0;">TifinCart</h1>
                <p style="color: #6b7280; font-size: 14px;">Kitchen Application Update</p>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid ${statusColor}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #333;">Your kitchen "${kitchenName}" has been ${statusText}.</p>
            </div>

            <p style="margin-bottom: 20px; color: #4b5563;">Hello ${ownerName},</p>
            
            <p style="margin-bottom: 20px; color: #4b5563;">
                We have reviewed your kitchen application for "${kitchenName}" and have determined that it is ${statusText}.
            </p>
            
            ${remarks ? `
            <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #4b5563; font-style: italic;">
                    <strong>Admin remarks:</strong> ${remarks}
                </p>
            </div>` : ''}
            
            ${status === 'approved' ? `
            <p style="margin-bottom: 20px; color: #4b5563;">
                Congratulations! You can now start setting up your menu and accepting orders.
            </p>
            
            <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller/kitchens" 
                   style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Go to My Kitchens
                </a>
            </div>` : `
            <p style="margin-bottom: 20px; color: #4b5563;">
                If you have any questions or would like to submit a revised application, please contact our support team.
            </p>`}

            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
                Thank you for choosing TifinCart!
            </p>
        </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <tifincart@themoneymate.xyz>',
            to: ownerEmail,
            subject: `Your Kitchen Application Status: ${kitchenName}`,
            html: emailContent,
        });

        if (error) {
            console.error('Error sending kitchen status email:', error);
            return { success: false, error: "Failed to send notification email" };
        }
        // console.log("Notification email sent successfully:", data);

        return { success: true };
    } catch (error) {
        console.error('Error sending kitchen status email:', error);
        return { success: false, error: error.message };
    }
}
