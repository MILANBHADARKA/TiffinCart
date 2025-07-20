import dbConnect from "@/lib/dbConnect";
import Kitchen from "@/model/kitchen";
import { kitchenApprovedEmail } from "@/helper/kitchenApprovedEmail";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import User from "@/model/user";

export async function POST(request, { params }) {
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

        const admin = await User.findById(decoded.id);

        if (!admin || admin.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }


        const { id } = params;

        if (!id) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen ID is required" 
            }), { status: 400 });
        }

        // console.log("Kitchen ID:", id);
        const kitchen = await Kitchen.findById(id);
        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found" 
            }), { status: 404 });
        }

        kitchen.status = "approved";
        await kitchen.save();

        const owner = await User.findById(kitchen.ownerId);
        if (!owner) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen owner not found" 
            }), { status: 404 });
        }

        const ownerName = owner.name || "Kitchen Owner";
        const ownerEmail = owner.email || "";

        const emailSent = await kitchenApprovedEmail({
            ownerName,
            ownerEmail,
            kitchenName: kitchen.name,
            kitchenId: id
        });

        if (!emailSent.success) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: emailSent.error 
            }), { status: 500 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Kitchen approved successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen approval route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}