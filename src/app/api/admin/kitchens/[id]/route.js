import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { notifyKitchenOwner } from "@/helper/notifyKitchenOwner";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request, { params }) {
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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const kitchenId = await params.id;
        const kitchen = await Kitchen.findById(kitchenId).populate('ownerId', 'name email');

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchen }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in admin kitchen GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function PATCH(request, { params }) {
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

        const kitchenId = await params.id;
        const { status, adminRemarks } = await request.json();

        if (!status || !['approved', 'rejected', 'suspended'].includes(status)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid status value" 
            }), { status: 400 });
        }

        const kitchen = await Kitchen.findById(kitchenId);
        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found" 
            }), { status: 404 });
        }

        const owner = await User.findById(kitchen.ownerId);
        if (!owner) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen owner not found" 
            }), { status: 404 });
        }

        kitchen.status = status;
        kitchen.adminRemarks = adminRemarks || '';
        
        if (status === 'approved') {
            kitchen.isActive = true;
        } else {
            kitchen.isActive = false;
        }
        
        await kitchen.save();

        await notifyKitchenOwner({
            ownerEmail: owner.email,
            ownerName: owner.name,
            kitchenName: kitchen.name,
            status,
            remarks: adminRemarks
        });

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Kitchen ${status} successfully`,
            data: { kitchen }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in admin kitchen PATCH route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}


