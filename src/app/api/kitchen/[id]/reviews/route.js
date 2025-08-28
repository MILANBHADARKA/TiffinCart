import dbConnect from "@/lib/dbConnect";
import Order from "@/model/order";
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = await params.id;
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;

        const skip = (page - 1) * limit;

        // Get reviewed orders for this kitchen
        const orders = await Order.find({ 
            kitchenId: new mongoose.Types.ObjectId(kitchenId),
            status: 'delivered',
            isReviewed: true,
            'review.rating': { $exists: true }
        })
        .populate('customerId', 'name')
        .sort({ 'review.createdAt': -1 })
        .skip(skip)
        .limit(limit);

        const reviews = orders.map(order => ({
            _id: order._id,
            customerName: order.customerId?.name || 'Anonymous',
            rating: order.review.rating,
            comment: order.review.comment,
            createdAt: order.review.createdAt,
            orderDate: order.createdAt
        }));

        const totalReviews = await Order.countDocuments({ 
            kitchenId: new mongoose.Types.ObjectId(kitchenId),
            status: 'delivered',
            isReviewed: true,
            'review.rating': { $exists: true }
        });

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                reviews,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    hasNextPage: page < Math.ceil(totalReviews / limit),
                    hasPrevPage: page > 1
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
