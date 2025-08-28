import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const orderId = await params.id;
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Authentication required" 
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        // Find order that belongs to this customer
        const order = await Order.findOne({ 
            _id: orderId, 
            customerId: user._id 
        }).populate('kitchenId', 'name')
          .populate('sellerId', 'name');

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { order } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error fetching order details:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
