import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

// Get a specific order
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { orderId } = params;
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        // Find the order
        const order = await Order.findById(orderId)
            .populate('kitchenId', 'name cuisine')
            .populate('customerId', 'name email phoneNumber')
            .lean();

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found" 
            }), { status: 404 });
        }

        // Verify permission to view this order
        if (
            (user.role === 'seller' && order.sellerId.toString() !== user._id.toString()) &&
            (user.role === 'customer' && order.customerId._id.toString() !== user._id.toString())
        ) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "You don't have permission to view this order" 
            }), { status: 403 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { order }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in order GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Update order status
export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const { orderId } = params;
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
        
        if (!status) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Status is required" 
            }), { status: 400 });
        }

        // Find the order and verify ownership
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

        // Check if order is already in a final state (delivered or cancelled)
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Cannot update order in final state" 
            }), { status: 400 });
        }

        // Update the status
        order.status = status;
        
        // Add note to status history if provided
        const statusUpdate = {
            status,
            timestamp: new Date(),
        };
        
        if (note) {
            statusUpdate.note = note;
        }
        
        order.statusHistory.push(statusUpdate);
        
        await order.save();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                order,
                message: `Order status updated to ${status}`
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in order PATCH route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
