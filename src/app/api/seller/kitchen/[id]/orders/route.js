import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = params.id;
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

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

        // Verify kitchen ownership
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        });

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        // Build query
        let query = { kitchenId };
        if (status) {
            query.status = status;
        }

        // Get orders for this kitchen with pagination
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('customerId', 'name email')
            .lean();

        // Get total count for pagination
        const totalOrders = await Order.countDocuments(query);

        // Format orders for frontend display
        const formattedOrders = orders.map(order => ({
            id: order._id,
            orderId: order._id.toString().slice(-8).toUpperCase(),
            customer: order.customerId?.name || 'Customer',
            amount: order.totalAmount,
            items: order.items.length,
            status: order.status,
            time: new Date(order.createdAt).toLocaleString(),
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt
        }));

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                orders: formattedOrders,
                pagination: {
                    total: totalOrders,
                    page,
                    limit,
                    pages: Math.ceil(totalOrders / limit)
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen orders route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
