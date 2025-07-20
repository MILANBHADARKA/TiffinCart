import { resend } from "@/lib/resend";

export async function sendKitchenApprovalEmail({ kitchenData, ownerDetails }) {
    try {
        // Format the data for the email
        const kitchenAddress = `${kitchenData.address.street}, ${kitchenData.address.city}, ${kitchenData.address.state} - ${kitchenData.address.zipCode}`;
        
        const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #f97316; margin: 0;">TifinCart</h1>
                <p style="color: #6b7280; font-size: 14px;">New Kitchen Approval Request</p>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #333;">A new kitchen has been submitted for approval.</p>
            </div>

            <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Kitchen Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; width: 40%; font-weight: bold;">Name</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenData.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Cuisine</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenData.cuisine}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Address</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenAddress}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Contact Phone</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenData.contact.phone}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Contact Email</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenData.contact.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">FSSAI Number</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${kitchenData.license.fssaiNumber || 'Not provided'}</td>
                </tr>
            </table>

            <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; margin-top: 20px;">Owner Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; width: 40%; font-weight: bold;">Name</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ownerDetails.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ownerDetails.email}</td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/kitchens" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Kitchen</a>
            </div>
        </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <tifincart@themoneymate.xyz>',
            to: process.env.ADMIN_EMAIL,
            subject: `New Kitchen Approval Request: ${kitchenData.name}`,
            html: emailContent,
        });

        // console.log("Email sent successfully:", data);

        if (error) {
            console.error('Error sending kitchen approval email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending kitchen approval email:', error);
        return { success: false, error: 'Failed to send kitchen approval email' };
    }
}
      