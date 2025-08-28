import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = await params.id;
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
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { isCurrentlyOpen } = await request.json();
        console.log("Received isCurrentlyOpen:", isCurrentlyOpen);
        
        if (typeof isCurrentlyOpen !== 'boolean') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "isCurrentlyOpen must be a boolean" 
            }), { status: 400 });
        }

        const kitchen = await Kitchen.findOneAndUpdate(
            { _id: kitchenId, ownerId: user._id },
            { $set: { isCurrentlyOpen } },
            { new: true }
        );

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchen } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in toggle kitchen status route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
