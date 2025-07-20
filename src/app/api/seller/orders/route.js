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
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const filter = { sellerId: user._id };
        if (status && status !== 'all') {
        filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('customerId', 'name email phonenumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalOrders = await Order.countDocuments(filter);

        const formattedOrders = orders.map(order => ({
            id: `#ORD-${order._id.toString().slice(-6).toUpperCase()}`,
            orderId: order._id,
            customer: order.customerId?.name || 'Unknown Customer',
            phone: order.customerId?.phonenumber || 'No phone',
            email: order.customerId?.email || '',
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: order.totalAmount,
            status: order.status,
            orderTime: getTimeAgo(order.createdAt),
            address: order.deliveryAddress || 'No address provided',
            paymentMethod: order.paymentMethod || 'cash',
            specialInstructions: order.specialInstructions || ''
        }));

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                orders: formattedOrders,
                pagination: {
                    current: page,
                    total: Math.ceil(totalOrders / limit),
                    count: totalOrders
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in orders route:", error);
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
        await order.save();

        return new Response(JSON.stringify({ 
            success: true, 
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

function getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}
