import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { SubscriptionPlan, SellerSubscription } from "@/model/subscription";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import crypto from "crypto";

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

        const { 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature,
            planId 
        } = await request.json();

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return new Response(JSON.stringify({
                success: false,
                error: "Payment verification failed"
            }), { status: 400 });
        }

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid subscription plan"
            }), { status: 400 });
        }

        // Cancel any existing active subscription
        await SellerSubscription.updateMany(
            { sellerId: user._id, status: 'active' },
            { status: 'cancelled' }
        );

        // Create new subscription (permanent)
        const subscription = new SellerSubscription({
            sellerId: user._id,
            planId: plan._id,
            status: 'active',
            activatedAt: new Date(),
            paymentDetails: {
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpaySignature: razorpay_signature,
                amount: plan.price,
                currency: 'INR'
            }
        });

        await subscription.save();

        return new Response(JSON.stringify({
            success: true,
            message: "Subscription activated successfully",
            data: {
                subscription: {
                    id: subscription._id,
                    planName: plan.name,
                    status: subscription.status,
                    activatedAt: subscription.activatedAt,
                    features: plan.features
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error verifying payment:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to verify payment"
        }), { status: 500 });
    }
}
            