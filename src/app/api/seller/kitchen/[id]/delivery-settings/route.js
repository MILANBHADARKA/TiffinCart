import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = params.id;
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

        const { deliveryCharge, freeDeliveryAbove, minimumOrder } = await request.json();

        // Verify kitchen ownership
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        });

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        // Update delivery settings
        kitchen.deliveryInfo = {
            ...kitchen.deliveryInfo,
            deliveryCharge: parseFloat(deliveryCharge) || 30,
            freeDeliveryAbove: freeDeliveryAbove ? parseFloat(freeDeliveryAbove) : null,
            minimumOrder: parseFloat(minimumOrder) || 100
        };

        await kitchen.save();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchen },
            message: "Delivery settings updated successfully"
        }), { status: 200 });

    } catch (error) {
        console.error("Error in delivery settings update route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}