import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
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

        // Find order and verify it belongs to this seller
        const order = await Order.findOne({ 
            _id: orderId, 
            sellerId: user._id 
        })
        .populate('customerId', 'name email phoneNumber')
        .populate('kitchenId', 'name address');

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found or you don't have permission" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { order },
            message: "Order details retrieved successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error in seller order details route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
