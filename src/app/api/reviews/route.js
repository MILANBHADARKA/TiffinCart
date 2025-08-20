import dbConnect from "@/lib/dbConnect";
import Review from "@/model/review";

export async function GET(request) {
    try {
        await dbConnect();

        const url = new URL(request.url);
        const kitchenId = url.searchParams.get('kitchenId');
        const menuItemId = url.searchParams.get('menuItemId');
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';

        let query = {};
        
        if (kitchenId) {
            query.kitchenId = kitchenId;
        }
        
        if (menuItemId) {
            query['itemReviews.menuItemId'] = menuItemId;
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const reviews = await Review.find(query)
            .populate('customerId', 'name profilePicture')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments(query);

        // If filtering by menuItemId, filter and format the response
        let formattedReviews = reviews;
        if (menuItemId) {
            formattedReviews = reviews.map(review => {
                const itemReview = review.itemReviews.find(item => 
                    item.menuItemId.toString() === menuItemId
                );
                return {
                    _id: review._id,
                    customerId: review.customerId,
                    orderId: review.orderId,
                    createdAt: review.createdAt,
                    itemReview: itemReview
                };
            }).filter(review => review.itemReview);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                reviews: formattedReviews,
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
        console.error("Error in reviews route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
