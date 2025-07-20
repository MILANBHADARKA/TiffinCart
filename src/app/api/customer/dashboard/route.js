import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Order from "@/model/order";
import MenuItem from "@/model/menuItem";
import Favorite from "@/model/favorite";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET() {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        // Aggregate dashboard data
        const [
            totalOrders,
            activeOrders,
            favoriteKitchens,
            recentOrders,
            nearbyKitchens,
            kitchenRatings
        ] = await Promise.all([
            // Total orders count
            Order.countDocuments({ customerId: user._id }),
            
            // Active orders count
            Order.countDocuments({ 
                customerId: user._id, 
                status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'] }
            }),
            
            // Favorite kitchens count
            Favorite.countDocuments({ customerId: user._id }),
            
            // Recent orders
            Order.find({ customerId: user._id })
                .populate('sellerId', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            
            // Nearby kitchens (sellers)
            User.find({ role: 'seller' })
                .select('name email rating totalRatings')
                .limit(5)
                .lean(),

            // Get rating data for kitchens
            Review.aggregate([
                { $match: { type: 'kitchen' } },
                {
                    $group: {
                        _id: '$sellerId',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Create rating map
        const ratingMap = {};
        kitchenRatings.forEach(item => {
            ratingMap[item._id.toString()] = {
                averageRating: Math.round(item.averageRating * 10) / 10,
                totalReviews: item.totalReviews
            };
        });

        const dashboardData = {
            totalOrders,
            activeOrders,
            favoriteKitchens,
            recentOrders: recentOrders.map(order => ({
                id: order._id,
                kitchenName: order.sellerId?.name || 'Unknown Kitchen',
                items: order.items.length,
                amount: order.totalAmount,
                status: order.status,
                orderTime: getTimeAgo(order.createdAt)
            })),
            nearbyKitchens: nearbyKitchens.map(seller => {
                const sellerRating = ratingMap[seller._id.toString()];
                return {
                    id: seller._id,
                    name: seller.name,
                    cuisine: 'Indian',
                    deliveryTime: Math.floor(Math.random() * 30) + 15,
                    rating: sellerRating ? sellerRating.averageRating : (seller.rating || 0),
                    totalReviews: sellerRating ? sellerRating.totalReviews : 0
                };
            })
        };

        return new Response(JSON.stringify({ 
            success: true, 
            data: dashboardData 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in customer dashboard route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}
