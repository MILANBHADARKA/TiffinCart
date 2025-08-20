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

        const url = new URL(request.url);
        const dateRange = url.searchParams.get('range') || '7days';
        const selectedKitchen = url.searchParams.get('kitchen') || 'all';

        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
            case '7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '3months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get seller's kitchens
        const kitchens = await Kitchen.find({ ownerId: user._id });
        const kitchenIds = kitchens.map(k => k._id);

        // Filter by specific kitchen if selected
        const filterKitchenIds = selectedKitchen === 'all' 
            ? kitchenIds 
            : [selectedKitchen];

        // Base query for orders
        const baseQuery = {
            sellerId: user._id,
            kitchenId: { $in: filterKitchenIds },
            createdAt: { $gte: startDate, $lte: now }
        };

        // Get orders for current period
        const orders = await Order.find(baseQuery);

        // Get orders for previous period (for comparison)
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(startDate);
        const timeDiff = now.getTime() - startDate.getTime();
        previousStartDate.setTime(startDate.getTime() - timeDiff);

        const previousOrders = await Order.find({
            sellerId: user._id,
            kitchenId: { $in: filterKitchenIds },
            createdAt: { $gte: previousStartDate, $lt: startDate }
        });

        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const revenueGrowth = previousRevenue === 0 ? 100 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

        const totalOrders = orders.length;
        const previousOrderCount = previousOrders.length;
        const ordersGrowth = previousOrderCount === 0 ? 100 : ((totalOrders - previousOrderCount) / previousOrderCount) * 100;

        const averageOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders;
        const previousAOV = previousOrderCount === 0 ? 0 : previousRevenue / previousOrderCount;
        const aovGrowth = previousAOV === 0 ? 100 : ((averageOrderValue - previousAOV) / previousAOV) * 100;

        // Get kitchen ratings
        const kitchenRatings = await Kitchen.find({ 
            ownerId: user._id,
            _id: { $in: filterKitchenIds }
        }).select('ratings');
        
        const averageRating = kitchenRatings.reduce((sum, kitchen) => sum + kitchen.ratings.average, 0) / kitchenRatings.length || 0;
        const totalReviews = kitchenRatings.reduce((sum, kitchen) => sum + kitchen.ratings.totalReviews, 0);

        // Order status distribution
        const ordersByStatus = await Order.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Popular items
        const popularItems = await Order.aggregate([
            { $match: baseQuery },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItemId',
                    name: { $first: '$items.name' },
                    price: { $first: '$items.price' },
                    totalOrdered: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 }
        ]);

        // Revenue by category
        const revenueByCategory = await Order.aggregate([
            { $match: baseQuery },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'menuitems',
                    localField: 'items.menuItemId',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' },
            {
                $group: {
                    _id: '$menuItem.category',
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Peak hours analysis
        const peakHours = await Order.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } },
            {
                $project: {
                    hour: '$_id',
                    orders: 1,
                    _id: 0
                }
            }
        ]);

        // Fill missing hours with 0
        const allHours = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            orders: peakHours.find(h => h.hour === i)?.orders || 0
        }));

        // Customer metrics
        const uniqueCustomers = [...new Set(orders.map(order => order.customerId.toString()))];
        const repeatCustomers = await Order.aggregate([
            { $match: { sellerId: user._id, kitchenId: { $in: filterKitchenIds } } },
            { $group: { _id: '$customerId', orderCount: { $sum: 1 } } },
            { $match: { orderCount: { $gt: 1 } } }
        ]);

        const customerMetrics = {
            totalCustomers: uniqueCustomers.length,
            repeatCustomers: repeatCustomers.length,
            retentionRate: uniqueCustomers.length === 0 ? 0 : (repeatCustomers.length / uniqueCustomers.length) * 100,
            avgOrdersPerCustomer: uniqueCustomers.length === 0 ? 0 : totalOrders / uniqueCustomers.length
        };

        const analyticsData = {
            metrics: {
                totalRevenue,
                revenueGrowth,
                totalOrders,
                ordersGrowth,
                averageOrderValue,
                aovGrowth,
                averageRating,
                totalReviews
            },
            ordersByStatus,
            popularItems,
            revenueByCategory,
            peakHours: allHours,
            customerMetrics,
            kitchens: kitchens.map(k => ({ _id: k._id, name: k.name }))
        };

        return new Response(JSON.stringify({ 
            success: true, 
            data: analyticsData
        }), { status: 200 });

    } catch (error) {
        console.error("Error in seller analytics route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
