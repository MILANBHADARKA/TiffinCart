import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
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
                error: "Only customers can review orders" 
            }), { status: 403 });
        }

        const { rating, comment } = await request.json();

        if (!rating || rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Rating must be between 1 and 5" 
            }), { status: 400 });
        }

        // Find order and verify ownership
        const order = await Order.findOne({ 
            _id: orderId, 
            customerId: user._id,
            status: 'delivered'
        });

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found or not delivered yet" 
            }), { status: 404 });
        }

        if (order.isReviewed) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "You have already reviewed this order" 
            }), { status: 400 });
        }

        // Add review to order
        order.review = {
            rating: parseInt(rating),
            comment: comment || '',
            createdAt: new Date()
        };
        order.isReviewed = true;
        
        await order.save();

        // Update kitchen average rating
        await updateKitchenRating(order.kitchenId);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Review submitted successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error submitting review:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

async function updateKitchenRating(kitchenId) {
    try {
        // Get all reviewed orders for this kitchen
        const reviewedOrders = await Order.find({ 
            kitchenId: kitchenId,
            isReviewed: true,
            'review.rating': { $exists: true }
        });

        if (reviewedOrders.length > 0) {
            const totalRating = reviewedOrders.reduce((sum, order) => sum + order.review.rating, 0);
            const averageRating = Math.round((totalRating / reviewedOrders.length) * 10) / 10;

            await Kitchen.findByIdAndUpdate(kitchenId, {
                'ratings.average': averageRating,
                'ratings.totalReviews': reviewedOrders.length
            });
        }
    } catch (error) {
        console.error("Error updating kitchen rating:", error);
    }
}
