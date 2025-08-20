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

        // Get order metrics
        const totalOrders = await Order.countDocuments({ kitchenId });
        
        const completedOrders = await Order.countDocuments({ 
            kitchenId, 
            status: 'delivered' 
        });
        
        const pendingOrders = await Order.countDocuments({
            kitchenId,
            status: { $nin: ['delivered', 'cancelled'] }
        });
        
        // Calculate revenue from completed orders
        const revenueResult = await Order.aggregate([
            { 
                $match: { 
                    kitchenId: kitchen._id,
                    status: 'delivered'
                } 
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);
        
        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
        // Get kitchen average rating
        const averageRating = kitchen.ratings?.average || 0;
        
        // Get stats for today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.countDocuments({
            kitchenId,
            createdAt: { $gte: today }
        });
        
        const todayRevenue = await Order.aggregate([
            { 
                $match: { 
                    kitchenId: kitchen._id,
                    status: 'delivered',
                    createdAt: { $gte: today }
                } 
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Compile all metrics
        const metrics = {
            totalOrders,
            completedOrders,
            pendingOrders,
            cancelledOrders: totalOrders - completedOrders - pendingOrders,
            revenue,
            averageRating,
            todayOrders,
            todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0
        };

        return new Response(JSON.stringify({ 
            success: true, 
            data: metrics 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen metrics route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}