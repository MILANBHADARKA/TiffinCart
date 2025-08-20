import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const orderId = params.id;
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
        
        // Add status history entry with note
        order.statusHistory.push({
            status: status,
            timestamp: new Date(),
            note: note || undefined
        });

        await order.save();

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
