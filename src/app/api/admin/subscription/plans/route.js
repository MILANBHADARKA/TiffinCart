import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { SubscriptionPlan } from "@/model/subscription";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

// Get all subscription plans
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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: "Admin access required"
            }), { status: 403 });
        }

        const plans = await SubscriptionPlan.find({}).sort({ createdAt: -1 });
        
        return new Response(JSON.stringify({
            success: true,
            data: { plans }
        }), { status: 200 });
        
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to fetch subscription plans"
        }), { status: 500 });
    }
}

// Create new subscription plan
export async function POST(request) {
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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: "Admin access required"
            }), { status: 403 });
        }

        const planData = await request.json();
        
        // Validate required fields
        const { name, price, features } = planData;
        if (!name || price === undefined || price === null || !features) {
            return new Response(JSON.stringify({
                success: false,
                error: "Missing required fields: name, price, and features are required"
            }), { status: 400 });
        }

        // Validate price is a valid number
        if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            return new Response(JSON.stringify({
                success: false,
                error: "Price must be a valid number greater than or equal to 0"
            }), { status: 400 });
        }

        // Ensure features has required properties with defaults
        const processedPlanData = {
            ...planData,
            price: parseFloat(price),
            features: {
                maxKitchens: features.maxKitchens || 1,
                maxMenuItemsPerKitchen: features.maxMenuItemsPerKitchen || 3,
                prioritySupport: features.prioritySupport || false,
                analyticsAccess: features.analyticsAccess || false,
                customization: features.customization || false
            }
        };

        // Check if plan name already exists
        const existingPlan = await SubscriptionPlan.findOne({ name });
        if (existingPlan) {
            return new Response(JSON.stringify({
                success: false,
                error: "Plan name already exists"
            }), { status: 400 });
        }

        const newPlan = new SubscriptionPlan(processedPlanData);
        await newPlan.save();

        return new Response(JSON.stringify({
            success: true,
            message: "Subscription plan created successfully",
            data: { plan: newPlan }
        }), { status: 201 });

    } catch (error) {
        console.error("Error creating subscription plan:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to create subscription plan"
        }), { status: 500 });
    }
}
