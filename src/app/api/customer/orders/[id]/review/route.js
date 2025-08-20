import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import Review from "@/model/review";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { kitchenReview, itemReviews } = await request.json();

        // Find and verify order
        const order = await Order.findOne({ 
            _id: orderId, 
            customerId: user._id,
            status: 'delivered' // Only delivered orders can be reviewed
        });

        if (!order) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order not found or cannot be reviewed" 
            }), { status: 404 });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ 
            customerId: user._id, 
            orderId: orderId 
        });

        if (existingReview) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Review already submitted for this order" 
            }), { status: 400 });
        }

        // Create new review
        const review = new Review({
            customerId: user._id,
            orderId: orderId,
            kitchenId: order.kitchenId,
            kitchenReview,
            itemReviews
        });

        await review.save();

        // Update order with review data
        if (kitchenReview) {
            order.kitchenReview = {
                ...kitchenReview,
                timestamp: new Date()
            };
            order.reviewStatus.kitchenReviewCompleted = true;
        }

        if (itemReviews && itemReviews.length > 0) {
            // Update individual item reviews in order
            itemReviews.forEach(itemReview => {
                const orderItem = order.items.find(item => 
                    item.menuItemId.toString() === itemReview.menuItemId
                );
                if (orderItem) {
                    orderItem.review = {
                        rating: itemReview.rating,
                        comment: itemReview.comment,
                        timestamp: new Date()
                    };
                }
            });
            order.reviewStatus.itemReviewsCompleted = true;
        }

        await order.save();

        // Update kitchen ratings
        if (kitchenReview) {
            await updateKitchenRatings(order.kitchenId);
        }

        // Update menu item ratings
        if (itemReviews && itemReviews.length > 0) {
            for (const itemReview of itemReviews) {
                await updateMenuItemRatings(itemReview.menuItemId);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { review },
            message: "Review submitted successfully"
        }), { status: 201 });

    } catch (error) {
        console.error("Error in review submission route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Helper function to update kitchen ratings
async function updateKitchenRatings(kitchenId) {
    try {
        const reviews = await Review.find({ 
            kitchenId: kitchenId,
            'kitchenReview.rating': { $exists: true }
        });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.kitchenReview.rating, 0);
            const averageRating = totalRating / reviews.length;

            await Kitchen.findByIdAndUpdate(kitchenId, {
                'ratings.average': averageRating,
                'ratings.totalReviews': reviews.length
            });
        }
    } catch (error) {
        console.error("Error updating kitchen ratings:", error);
    }
}

// Helper function to update menu item ratings
async function updateMenuItemRatings(menuItemId) {
    try {
        const reviews = await Review.find({ 
            'itemReviews.menuItemId': menuItemId
        });

        let totalRating = 0;
        let reviewCount = 0;

        reviews.forEach(review => {
            const itemReview = review.itemReviews.find(item => 
                item.menuItemId.toString() === menuItemId.toString()
            );
            if (itemReview) {
                totalRating += itemReview.rating;
                reviewCount++;
            }
        });

        if (reviewCount > 0) {
            const averageRating = totalRating / reviewCount;

            await MenuItem.findByIdAndUpdate(menuItemId, {
                'ratings.average': averageRating,
                'ratings.totalReviews': reviewCount
            });
        }
    } catch (error) {
        console.error("Error updating menu item ratings:", error);
    }
}
