import { resend } from "@/lib/resend";
import NewOrderEmail from "../../emails/NewOrder";

export async function sendNewOrderEmail({ orderData, sellerDetails, customerDetails }) {
    try {
        if (!orderData || !sellerDetails || !customerDetails) {
            throw new Error('Missing required data for sending new order email');
        }

        const emailData = {
            sellerName: sellerDetails.name,
            customerName: customerDetails.name,
            orderId: orderData._id.toString(),
            kitchenName: orderData.kitchenId?.name || 'Unknown Kitchen',
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            deliveryDate: orderData.deliveryDate,
            deliveryTimeWindow: orderData.deliveryTimeWindow,
            mealCategory: orderData.mealCategory,
            paymentMethod: orderData.paymentMethod
        };

        const { data, error } = await resend.emails.send({
            from: 'TifinCart <orders@themoneymate.xyz>',
            to: [sellerDetails.email],
            subject: `🍱 New ${emailData.mealCategory} Order #${emailData.orderId.slice(-8)} - ₹${emailData.totalAmount}`,
            react: NewOrderEmail(emailData),
        });

        if (error) {
            console.error('Error sending new order email:', error);
            return { success: false, error: error.message };
        }

        console.log('New order email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendNewOrderEmail:', error);
        return { success: false, error: error.message };
    }
}
