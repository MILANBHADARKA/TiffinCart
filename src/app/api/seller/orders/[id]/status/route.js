import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { sendOrderDeliveredEmail } from "@/helper/orderDelivered";

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const orderId = await params.id;
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "No token found" 
            }), { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid token" 
            }), { status: 401 });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { status, note } = await request.json();

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid status" 
            }), { status: 400 });
        }

        // Find order and verify it belongs to this seller
        const order = await Order.findOne({ 
            _id: orderId, 
            sellerId: user._id 
        });

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found or you don't have permission" 
            }), { status: 404 });
        }

        // Update order status
        order.status = status;
        await order.save();

        // Send delivery confirmation email if order is delivered
        if (status === 'delivered') {
            try {
                const orderWithPopulatedData = await Order.findById(order._id)
                    .populate('customerId', 'name email')
                    .populate('kitchenId', 'name')
                    .populate('sellerId', 'name');

                const emailData = await sendOrderDeliveredEmail({
                    orderData: orderWithPopulatedData,
                    customerDetails: {
                        name: orderWithPopulatedData.customerId.name,
                        email: orderWithPopulatedData.customerId.email
                    },
                    sellerDetails: {
                        name: orderWithPopulatedData.sellerId.name
                    }
                });

                // console.log('Order delivered email data:', emailData);
            } catch (emailError) {
                console.error('Error sending order delivered email:', emailError);
                // Don't fail the status update if email fails
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { order },
            message: "Order status updated successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error in order status update route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
