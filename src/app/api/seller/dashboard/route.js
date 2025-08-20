import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";
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

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Get seller's kitchens
        const kitchens = await Kitchen.find({ ownerId: user._id });
        const activeKitchens = kitchens.filter(k => k.isCurrentlyOpen).length;

        // Today's orders and revenue
        const todayOrders = await Order.find({
            sellerId: user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const todayStats = {
            orders: todayOrders.length,
            revenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        };

        // Pending orders (requiring action)
        const pendingOrders = await Order.find({
            sellerId: user._id,
            status: { $in: ['pending', 'confirmed', 'preparing'] }
        }).populate('customerId', 'name email').sort({ createdAt: -1 });

        // Recent orders (last 10)
        const recentOrders = await Order.find({
            sellerId: user._id
        }).populate('customerId', 'name email')
          .populate('kitchenId', 'name')
          .sort({ createdAt: -1 })
          .limit(10);

        // Urgent actions
        const urgentActions = [];

        // Check for orders pending confirmation
        const pendingConfirmation = await Order.countDocuments({
            sellerId: user._id,
            status: 'pending'
        });

        if (pendingConfirmation > 0) {
            urgentActions.push({
                type: 'order',
                title: `${pendingConfirmation} orders awaiting confirmation`,
                description: 'Review and confirm new orders to start preparation',
                actionText: 'View Orders',
                action: () => window.location.href = '/seller/orders?status=pending'
            });
        }

        // Check for orders ready for delivery
        const readyForDelivery = await Order.countDocuments({
            sellerId: user._id,
            status: 'preparing'
        });

        if (readyForDelivery > 0) {
            urgentActions.push({
                type: 'order',
                title: `${readyForDelivery} orders ready for delivery`,
                description: 'Mark orders as out for delivery',
                actionText: 'Update Status',
                action: () => window.location.href = '/seller/orders?status=preparing'
            });
        }

        // Check for low-rated items (if any reviews below 3 stars)
        const lowRatedKitchens = kitchens.filter(k => k.ratings.average < 3 && k.ratings.totalReviews > 0);
        if (lowRatedKitchens.length > 0) {
            urgentActions.push({
                type: 'quality',
                title: 'Low ratings detected',
                description: `${lowRatedKitchens.length} kitchen(s) have ratings below 3 stars`,
                actionText: 'Improve Quality',
                action: () => window.location.href = '/seller/analytics'
            });
        }

        // Check for inactive kitchens
        const inactiveKitchens = kitchens.filter(k => !k.isCurrentlyOpen);
        if (inactiveKitchens.length > 0) {
            urgentActions.push({
                type: 'info',
                title: `${inactiveKitchens.length} kitchen(s) are closed`,
                description: 'Consider opening kitchens to receive more orders',
                actionText: 'Manage Kitchens',
                action: () => window.location.href = '/seller/kitchens'
            });
        }

        // Low stock warnings (mock data - you can implement actual inventory tracking)
        const lowStockItems = await MenuItem.countDocuments({
            kitchenId: { $in: kitchens.map(k => k._id) },
            isAvailable: false
        });

        if (lowStockItems > 0) {
            urgentActions.push({
                type: 'stock',
                title: `${lowStockItems} items are unavailable`,
                description: 'Update menu item availability',
                actionText: 'Update Menu',
                action: () => window.location.href = '/seller/kitchens'
            });
        }

        const dashboardData = {
            todayStats,
            activeKitchens,
            pendingOrders,
            recentOrders,
            urgentActions
        };

        return new Response(JSON.stringify({ 
            success: true, 
            data: dashboardData
        }), { status: 200 });

    } catch (error) {
        console.error("Error in seller dashboard route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
