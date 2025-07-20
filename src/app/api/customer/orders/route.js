import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build filter
        const filter = { customerId: user._id };
        if (status && status !== 'all') {
            if (status === 'active') {
                filter.status = { $in: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'] };
            } else {
                filter.status = status;
            }
        }

        const orders = await Order.find(filter)
            .populate('sellerId', 'name email')
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const formattedOrders = orders.map(order => ({
            id: `#ORD-${order._id.toString().slice(-6).toUpperCase()}`,
            orderId: order._id,
            sellerId: order.sellerId._id, // Ensure seller ID is properly included
            kitchenName: order.sellerId?.name || 'Unknown Kitchen',
            kitchenId: order.sellerId._id, // Also include as kitchenId for compatibility
            items: order.items.map(item => ({
                menuItemId: item.menuItemId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                specialInstructions: item.specialInstructions
            })),
            total: order.totalAmount,
            status: order.status,
            orderTime: getTimeAgo(order.createdAt),
            deliveryAddress: order.deliveryAddress || 'No address provided'
        }));

        return new Response(JSON.stringify({ 
            success: true, 
            data: { orders: formattedOrders }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in customer orders route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function POST(request) {
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { sellerId, items, totalAmount, deliveryAddress } = await request.json();

        if (!sellerId || !items || !items.length || !totalAmount) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Missing required fields" 
            }), { status: 400 });
        }

        // Create new order
        const newOrder = new Order({
            customerId: user._id,
            sellerId,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress || 'No address provided',
            status: 'pending',
            paymentMethod: 'cash',
            paymentStatus: 'pending'
        });

        await newOrder.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Order placed successfully",
            data: { orderId: newOrder._id }
        }), { status: 201 });

    } catch (error) {
        console.error("Error creating order:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}
