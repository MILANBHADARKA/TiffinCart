import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        await dbConnect();

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

        // Find all orders for this seller's kitchens
        const orders = await Order.find({ sellerId: user._id })
            .populate('customerId', 'name email')
            .populate('kitchenId', 'name')
            .sort({ createdAt: -1 });

        return new Response(JSON.stringify({ 
            success: true, 
            data: { orders },
            message: "Orders retrieved successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error in seller orders route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();

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

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order ID and status are required" 
            }), { status: 400 });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid status" 
            }), { status: 400 });
        }

        const order = await Order.findOne({ 
            _id: orderId, 
            sellerId: user._id 
        });

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found" 
            }), { status: 404 });
        }

        order.status = status;
        order.updatedAt = new Date();
        
        // Add to status history
        order.statusHistory.push({
            status: status,
            timestamp: new Date()
        });

        await order.save();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { order },
            message: "Order status updated successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error updating order status:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

