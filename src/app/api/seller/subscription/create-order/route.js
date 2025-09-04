import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { SubscriptionPlan } from "@/model/subscription";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import razorpay from "@/lib/razorpay";

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
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({
                success: false,
                error: "Unauthorized access"
            }), { status: 403 });
        }

        const { planId } = await request.json();
        
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid subscription plan"
            }), { status: 400 });
        }

        // Create Razorpay order
        const orderOptions = {
            amount: plan.price * 100, // amount in paise
            currency: 'INR',
            receipt: `sub_${user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`, // Keep under 40 chars
            notes: {
                sellerId: user._id.toString(),
                planId: plan._id.toString(),
                planName: plan.name
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        return new Response(JSON.stringify({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                plan: {
                    id: plan._id,
                    name: plan.name,
                    price: plan.price,
                    features: plan.features,
                    duration: plan.duration
                },
                razorpayKeyId: process.env.RAZORPAY_KEY_ID
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error creating subscription order:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to create payment order"
        }), { status: 500 });
    }
}
