import { resend } from "@/lib/resend";
import OrderDeliveredEmail from "../../emails/OrderDelivered";

export async function sendOrderDeliveredEmail({ orderData, customerDetails, sellerDetails }) {
    try {
        if (!orderData || !customerDetails) {
            throw new Error('Missing required data for sending order delivered email');
        }

        const emailData = {
            customerName: customerDetails.name,
            orderId: orderData._id,
            kitchenName: orderData.kitchenId?.name || 'Unknown Kitchen',
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            deliveryDate: orderData.deliveryDate,
            mealCategory: orderData.mealCategory,
            sellerName: sellerDetails?.name || 'Our Chef'
        };

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <delivery@themoneymate.xyz>',
            to: [customerDetails.email],
            subject: `🎉 Your ${emailData.mealCategory} Order #${emailData.orderId.slice(-8)} has been Delivered!`,
            react: OrderDeliveredEmail(emailData),
        });

        if (error) {
            console.error('Error sending order delivered email:', error);
            return { success: false, error: error.message };
        }

        console.log('Order delivered email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendOrderDeliveredEmail:', error);
        return { success: false, error: error.message };
    }
}