import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

// GET all menu items for a kitchen
export async function GET(request, { params }) {
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

        // For GET requests, we allow both customers and sellers to view menu items
        const user = await User.findById(decoded.id);
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        // If the user is a seller, verify kitchen ownership
        if (user.role === 'seller') {
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
        }

        // Get all menu items for this kitchen
        const items = await MenuItem.find({ kitchenId }).sort({ category: 1, name: 1 }).lean();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { items } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen menu GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// POST a new menu item
export async function POST(request, { params }) {
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

        const itemData = await request.json();
        itemData.kitchenId = kitchenId;

        // Extract delivery settings from the request
        const { deliveryCharge, freeDeliveryAbove, ...menuItemData } = itemData;

        // Update kitchen delivery settings if provided
        if (deliveryCharge !== undefined || freeDeliveryAbove !== undefined) {
            const updateData = {};
            if (deliveryCharge !== undefined) {
                updateData['deliveryInfo.deliveryCharge'] = parseFloat(deliveryCharge) || 30;
            }
            if (freeDeliveryAbove !== undefined) {
                updateData['deliveryInfo.freeDeliveryAbove'] = freeDeliveryAbove ? parseFloat(freeDeliveryAbove) : null;
            }
            
            await Kitchen.findByIdAndUpdate(kitchenId, updateData);
        }

        // Validate tiffin-specific data
        if (!['Breakfast', 'Lunch', 'Dinner'].includes(menuItemData.category)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid category. Must be Breakfast, Lunch, or Dinner" 
            }), { status: 400 });
        }

        // Create new menu item
        const menuItem = new MenuItem(menuItemData);
        await menuItem.save();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { item: menuItem },
            message: "Tiffin item added successfully"
        }), { status: 201 });

    } catch (error) {
        console.error("Error in kitchen menu POST route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
