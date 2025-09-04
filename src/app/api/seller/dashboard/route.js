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

        // Get date ranges
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Get seller's kitchens
        const kitchens = await Kitchen.find({ ownerId: user._id });
        const kitchenIds = kitchens.map(k => k._id);
        const totalKitchens = kitchens.length;
        const activeKitchens = kitchens.filter(k => k.isCurrentlyOpen && k.status === 'approved').length;
        const pendingApprovalKitchens = kitchens.filter(k => k.status === 'pending').length;

        // All orders for this seller
        const allOrders = await Order.find({ sellerId: user._id });
        const totalOrders = allOrders.length;

        // Today's orders and revenue
        const todayOrders = await Order.find({
            sellerId: user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const todayStats = {
            orders: todayOrders.length,
            revenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        };

        // Monthly revenue
        const monthlyOrders = await Order.find({
            sellerId: user._id,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: 'cancelled' }
        });

        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Order status counts
        const pendingOrdersCount = await Order.countDocuments({
            sellerId: user._id,
            status: 'pending'
        });

        const preparingOrdersCount = await Order.countDocuments({
            sellerId: user._id,
            status: 'preparing'
        });

        const readyOrdersCount = await Order.countDocuments({
            sellerId: user._id,
            status: 'out_for_delivery'
        });

        const completedOrdersCount = await Order.countDocuments({
            sellerId: user._id,
            status: 'delivered'
        });

        // Recent orders (last 10)
        const recentOrders = await Order.find({
            sellerId: user._id
        }).populate('customerId', 'name email')
          .populate('kitchenId', 'name')
          .sort({ createdAt: -1 })
          .limit(5);

        // Pending orders (requiring immediate action)
        const pendingOrders = await Order.find({
            sellerId: user._id,
            status: { $in: ['pending', 'confirmed', 'preparing'] }
        }).populate('customerId', 'name email')
          .populate('kitchenId', 'name')
          .sort({ createdAt: -1 })
          .limit(5);

        // Kitchen performance
        const kitchenPerformance = await Promise.all(
            kitchens.map(async (kitchen) => {
                const kitchenOrders = await Order.find({
                    kitchenId: kitchen._id,
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                });

                const revenue = kitchenOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                const avgRating = kitchen.ratings.average || 0;

                return {
                    kitchenId: kitchen._id,
                    name: kitchen.name,
                    orders: kitchenOrders.length,
                    revenue,
                    rating: avgRating,
                    status: kitchen.status,
                    isOpen: kitchen.isCurrentlyOpen
                };
            })
        );

        // Popular items across all kitchens
        const menuItems = await MenuItem.find({ 
            kitchenId: { $in: kitchenIds } 
        }).populate('kitchenId', 'name');

        // Calculate item popularity from orders
        const itemOrderCounts = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const itemId = item.menuItemId.toString();
                itemOrderCounts[itemId] = (itemOrderCounts[itemId] || 0) + item.quantity;
            });
        });

        const popularItems = menuItems
            .map(item => ({
                _id: item._id,
                name: item.name,
                kitchenName: item.kitchenId.name,
                price: item.price,
                category: item.category,
                orderCount: itemOrderCounts[item._id.toString()] || 0,
                isAvailable: item.isAvailable
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5);

        // Urgent actions
        const urgentActions = [];

        // Check for orders pending confirmation
        if (pendingOrdersCount > 0) {
            urgentActions.push({
                type: 'order',
                title: `${pendingOrdersCount} orders awaiting confirmation`,
                description: 'Review and confirm new orders to start preparation',
                actionText: 'View Orders',
                priority: 'high'
            });
        }

        // Check for orders ready for delivery
        if (preparingOrdersCount > 0) {
            urgentActions.push({
                type: 'order',
                title: `${preparingOrdersCount} orders in preparation`,
                description: 'Complete preparation and mark as ready for delivery',
                actionText: 'Update Status',
                priority: 'medium'
            });
        }

        // Check for kitchens pending approval
        if (pendingApprovalKitchens > 0) {
            urgentActions.push({
                type: 'approval',
                title: `${pendingApprovalKitchens} kitchen(s) pending approval`,
                description: 'Your kitchen submissions are under admin review',
                actionText: 'Manage Kitchens',
                priority: 'low'
            });
        }

        // Check for low-rated kitchens
        const lowRatedKitchens = kitchens.filter(k => k.ratings.average < 3 && k.ratings.totalReviews > 0);
        if (lowRatedKitchens.length > 0) {
            urgentActions.push({
                type: 'quality',
                title: 'Low ratings detected',
                description: `${lowRatedKitchens.length} kitchen(s) have ratings below 3 stars`,
                actionText: 'Improve Quality',
                priority: 'medium'
            });
        }

        // Check for inactive kitchens
        const inactiveKitchens = kitchens.filter(k => !k.isCurrentlyOpen && k.status === 'approved');
        if (inactiveKitchens.length > 0) {
            urgentActions.push({
                type: 'info',
                title: `${inactiveKitchens.length} kitchen(s) are closed`,
                description: 'Consider opening kitchens to receive more orders',
                actionText: 'Manage Kitchens',
                priority: 'low'
            });
        }

        // Check for unavailable menu items
        const unavailableItems = await MenuItem.countDocuments({
            kitchenId: { $in: kitchenIds },
            isAvailable: false
        });

        if (unavailableItems > 0) {
            urgentActions.push({
                type: 'stock',
                title: `${unavailableItems} items are unavailable`,
                description: 'Update menu item availability to increase sales',
                actionText: 'Update Menu',
                priority: 'low'
            });
        }

        // Business insights
        const businessInsights = {
            totalMenuItems: await MenuItem.countDocuments({ kitchenId: { $in: kitchenIds } }),
            averageOrderValue: totalOrders > 0 ? (allOrders.reduce((sum, order) => sum + order.totalAmount, 0) / totalOrders) : 0,
            topPerformingKitchen: kitchenPerformance.sort((a, b) => b.revenue - a.revenue)[0] || null,
            thisWeekGrowth: await calculateWeeklyGrowth(user._id),
            customerRetentionRate: await calculateCustomerRetention(user._id)
        };

        const dashboardData = {
            totalKitchens,
            activeKitchens,
            pendingApprovalKitchens,
            totalOrders,
            monthlyRevenue,
            pendingOrdersCount,
            preparingOrdersCount,
            readyOrdersCount,
            completedOrdersCount,
            recentOrders,
            pendingOrders,
            kitchenPerformance,
            popularItems,
            urgentActions,
            todayStats,
            businessInsights
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

// Helper function to calculate weekly growth
async function calculateWeeklyGrowth(sellerId) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekOrders = await Order.countDocuments({
        sellerId,
        createdAt: { $gte: lastWeek, $lt: now },
        status: { $ne: 'cancelled' }
    });

    const lastWeekOrders = await Order.countDocuments({
        sellerId,
        createdAt: { $gte: twoWeeksAgo, $lt: lastWeek },
        status: { $ne: 'cancelled' }
    });

    if (lastWeekOrders === 0) return thisWeekOrders > 0 ? 100 : 0;
    return ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
}

// Helper function to calculate customer retention
async function calculateCustomerRetention(sellerId) {
    const orders = await Order.find({ 
        sellerId,
        status: 'delivered'
    }).select('customerId createdAt');

    const customerOrders = {};
    orders.forEach(order => {
        const customerId = order.customerId.toString();
        if (!customerOrders[customerId]) {
            customerOrders[customerId] = [];
        }
        customerOrders[customerId].push(order.createdAt);
    });

    const totalCustomers = Object.keys(customerOrders).length;
    const returningCustomers = Object.values(customerOrders).filter(dates => dates.length > 1).length;

    return totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
}
