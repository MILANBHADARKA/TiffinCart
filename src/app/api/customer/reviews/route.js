import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import Review from "@/model/review";
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const sellerId = searchParams.get('sellerId');
        const menuItemId = searchParams.get('menuItemId');
        const type = searchParams.get('type');

        const filter = {};
        if (sellerId) filter.sellerId = sellerId;
        if (menuItemId) filter.menuItemId = menuItemId;
        if (type) filter.type = type;

        const reviews = await Review.find(filter)
            .populate('customerId', 'name')
            .populate('sellerId', 'name')
            .populate('menuItemId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { reviews }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in reviews GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function POST(request) {
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const requestBody = await request.json();
        console.log('Received review data:', JSON.stringify(requestBody, null, 2));

        const { 
            orderId, 
            sellerId, 
            menuItemId, 
            type, 
            rating, 
            title, 
            comment, 
            tags 
        } = requestBody;

        if (!orderId) {
            console.log('Missing orderId in request');
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Order ID is required" 
            }), { status: 400 });
        }

        if (!sellerId) {
            console.log('Missing sellerId in request. Full request:', requestBody);
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Seller ID is required. Please ensure the order contains kitchen information." 
            }), { status: 400 });
        }

        if (!sellerId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid sellerId format:', sellerId);
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid seller ID format" 
            }), { status: 400 });
        }

        if (!type || !['kitchen', 'item'].includes(type)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Valid review type is required (kitchen or item)" 
            }), { status: 400 });
        }

        if (!rating || rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Rating must be between 1 and 5" 
            }), { status: 400 });
        }

        if (!title || !title.trim()) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Review title is required" 
            }), { status: 400 });
        }

        if (!comment || !comment.trim()) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Review comment is required" 
            }), { status: 400 });
        }

        if (type === 'item' && !menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required for item reviews" 
            }), { status: 400 });
        }

        console.log('Looking for order with:', { _id: orderId, customerId: user._id, sellerId: sellerId });
        
        const order = await Order.findOne({ 
            _id: orderId, 
            customerId: user._id, 
            sellerId: sellerId,
            status: 'delivered' 
        });

        if (!order) {
            console.log('Order not found with criteria:', { orderId, customerId: user._id, sellerId, status: 'delivered' });
            
            const orderExists = await Order.findOne({ _id: orderId, customerId: user._id });
            
            if (!orderExists) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "Order not found or you don't have permission to review it" 
                }), { status: 400 });
            } else if (orderExists.status !== 'delivered') {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "You can only review delivered orders" 
                }), { status: 400 });
            } else {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "Order found but seller mismatch. Please contact support." 
                }), { status: 400 });
            }
        }

        const existingReviewFilter = {
            customerId: user._id,
            orderId: orderId,
            sellerId: sellerId,
            type: type
        };

        if (type === 'item') {
            existingReviewFilter.menuItemId = menuItemId;
        } else {
            existingReviewFilter.menuItemId = null;
        }

        const existingReview = await Review.findOne(existingReviewFilter);

        if (existingReview) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `You have already reviewed this ${type}` 
            }), { status: 400 });
        }

        const reviewData = {
            customerId: user._id,
            orderId: orderId,
            sellerId: sellerId,
            type: type,
            rating: parseInt(rating),
            title: title.trim(),
            comment: comment.trim(),
            tags: Array.isArray(tags) ? tags : [],
            isVerifiedPurchase: true
        };

        if (type === 'item') {
            reviewData.menuItemId = menuItemId;
        }

        console.log('Creating review with data:', reviewData);

        const review = new Review(reviewData);
        await review.save();

        await updateAverageRatings(sellerId, menuItemId, type);

        await review.populate('customerId', 'name');
        await review.populate('sellerId', 'name');
        if (menuItemId) {
            await review.populate('menuItemId', 'name');
        }

        console.log('Review created successfully:', review._id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Review submitted successfully",
            data: { review }
        }), { status: 201 });

    } catch (error) {
        console.error("Error in reviews POST route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error: " + error.message 
        }), { status: 500 });
    }
}

async function updateAverageRatings(sellerId, menuItemId, type) {
    try {
        if (type === 'kitchen') {
            const ratings = await Review.aggregate([
                { $match: { sellerId: sellerId, type: 'kitchen' } },
                { 
                    $group: { 
                        _id: null, 
                        avgRating: { $avg: '$rating' },
                        totalRatings: { $sum: 1 }
                    }
                }
            ]);

            if (ratings.length > 0) {
                await User.findByIdAndUpdate(sellerId, {
                    rating: Math.round(ratings[0].avgRating * 10) / 10,
                    totalRatings: ratings[0].totalRatings
                });
            }
        }

        if (type === 'item' && menuItemId) {
            const ratings = await Review.aggregate([
                { $match: { menuItemId: menuItemId, type: 'item' } },
                { 
                    $group: { 
                        _id: null, 
                        avgRating: { $avg: '$rating' },
                        totalRatings: { $sum: 1 }
                    }
                }
            ]);

            if (ratings.length > 0) {
                await MenuItem.findByIdAndUpdate(menuItemId, {
                    rating: Math.round(ratings[0].avgRating * 10) / 10,
                    reviewCount: ratings[0].totalRatings
                });
            }
        }
    } catch (error) {
        console.error('Error updating average ratings:', error);
    }
}
