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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const dateRange = searchParams.get('dateRange') || '30days';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }

        // Date filtering
        if (dateRange !== 'all') {
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
                case '1year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(now.getDate() - 30);
            }
            
            query.createdAt = { $gte: startDate, $lte: now };
        }

        // Sort configuration
        const sortConfig = {};
        sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get total count 
        const totalOrders = await Order.countDocuments(query);

        // Fetch orders with pagination
        const orders = await Order.find(query)
            .populate('customerId', 'name email phone')
            .populate('sellerId', 'name email phone')
            .populate('kitchenId', 'name address cuisine')
            .sort(sortConfig)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Calculate summary statistics
        const stats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                    totalDeliveryFees: { $sum: '$deliveryFee' },
                    totalTax: { $sum: '$tax' }
                }
            }
        ]);

        // Status distribution
        const statusDistribution = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Payment method distribution
        const paymentMethodStats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Meal category distribution
        const mealCategoryStats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$mealCategory',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Top performing kitchens
        const topKitchens = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$kitchenId',
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'kitchens',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'kitchen'
                }
            },
            { $unwind: '$kitchen' }
        ]);

        return new Response(JSON.stringify({ 
            success: true, 
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNext: page < Math.ceil(totalOrders / limit),
                    hasPrev: page > 1
                },
                summary: {
                    totalRevenue: stats[0]?.totalRevenue || 0,
                    avgOrderValue: stats[0]?.avgOrderValue || 0,
                    totalDeliveryFees: stats[0]?.totalDeliveryFees || 0,
                    totalTax: stats[0]?.totalTax || 0,
                    totalOrders
                },
                analytics: {
                    statusDistribution,
                    paymentMethodStats,
                    mealCategoryStats,
                    topKitchens
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in admin orders GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function PATCH(request) {
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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { orderId, status, adminNote } = await request.json();

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

        const order = await Order.findById(orderId);
        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found" 
            }), { status: 404 });
        }

        order.status = status;
        order.statusHistory.push({
            status: status,
            timestamp: new Date(),
            note: adminNote || `Status updated by admin: ${user.name}`
        });

        await order.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Order status updated successfully",
            data: { order }
        }), { status: 200 });

    } catch (error) {
        console.error("Error updating order status:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
