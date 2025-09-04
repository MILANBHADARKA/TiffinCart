import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import { SubscriptionPlan } from "@/model/subscription";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

// Update subscription plan
export async function PUT(request, { params }) {
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

        const { id } = await params;
        const updateData = await request.json();

        // Check if plan exists
        const plan = await SubscriptionPlan.findById(id);
        if (!plan) {
            return new Response(JSON.stringify({
                success: false,
                error: "Subscription plan not found"
            }), { status: 404 });
        }

        // Check if new name conflicts with existing plans
        if (updateData.name && updateData.name !== plan.name) {
            const existingPlan = await SubscriptionPlan.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            if (existingPlan) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Plan name already exists"
                }), { status: 400 });
            }
        }

        const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return new Response(JSON.stringify({
            success: true,
            message: "Subscription plan updated successfully",
            data: { plan: updatedPlan }
        }), { status: 200 });

    } catch (error) {
        console.error("Error updating subscription plan:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to update subscription plan"
        }), { status: 500 });
    }
}

// Delete subscription plan
export async function DELETE(request, { params }) {
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

        const { id } = await params;

        // Check if plan exists
        const plan = await SubscriptionPlan.findById(id);
        if (!plan) {
            return new Response(JSON.stringify({
                success: false,
                error: "Subscription plan not found"
            }), { status: 404 });
        }

        if(!plan.isActive){
            await SubscriptionPlan.findByIdAndUpdate(id, { isActive: true });
        } else {
            await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false });
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Subscription plan deactivated successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error deleting subscription plan:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Failed to delete subscription plan"
        }), { status: 500 });
    }
}
