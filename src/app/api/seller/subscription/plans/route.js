import dbConnect from "@/lib/dbConnect";
import { SubscriptionPlan } from "@/model/subscription";

export async function GET() {
    try {
        await dbConnect();
        
        const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
        
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
