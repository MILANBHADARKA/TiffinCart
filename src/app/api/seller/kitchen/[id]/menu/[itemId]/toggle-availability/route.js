import dbConnect from "@/lib/dbConnect";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import Kitchen from "@/model/kitchen";
import User from "@/model/user";


export async function PATCH(request, { params }) {
    await dbConnect();
    const { id: kitchenId, itemId } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
        return new Response(JSON.stringify({ success: false, error: "No token found" }), { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
        return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'seller') {
        return new Response(JSON.stringify({
            success: false,
            error: "Unauthorized access"
        }), { status: 403 });
    }

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

    const { isAvailable } = await request.json();

    if (typeof isAvailable !== "boolean") {
        return new Response(JSON.stringify({ success: false, error: "isAvailable must be boolean" }), { status: 400 });
    }

    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
        return new Response(JSON.stringify({ success: false, error: "Menu item not found" }), { status: 404 });
    }

    menuItem.isAvailable = isAvailable;
    await menuItem.save();

    return new Response(JSON.stringify({ success: true, data: { menuItem } }), { status: 200 });
}
