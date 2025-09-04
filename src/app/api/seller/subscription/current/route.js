import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { SellerSubscription, SubscriptionPlan } from "@/model/subscription";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
    try {
        await dbConnect();
        
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
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({
                success: false,
                error: "Unauthorized access"
            }), { status: 403 });
        }

        // Get current active subscription
        const currentSubscription = await SellerSubscription.findOne({
            sellerId: user._id,
            status: 'active'
        }).populate('planId');

        if (!currentSubscription) {
            return new Response(JSON.stringify({
                success: true,
                data: {
                    hasSubscription: false,
                    currentPlan: null,
                    limits: {
                        maxKitchens: 1,
                        maxMenuItemsPerKitchen: 3,
                        prioritySupport: false,
                        analyticsAccess: false,
                        customization: false
                    }
                }
            }), { status: 200 });
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                hasSubscription: true,
                currentPlan: {
                    id: currentSubscription.planId._id,
                    name: currentSubscription.planId.name,
                    price: currentSubscription.planId.price,
                    features: currentSubscription.planId.features,
                    activatedAt: currentSubscription.activatedAt
                },
                limits: currentSubscription.planId.features
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error fetching current subscription:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to fetch subscription status"
        }), { status: 500 });
    }
}
