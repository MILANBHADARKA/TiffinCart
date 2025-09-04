import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { checkMenuItemLimit } from "@/lib/subscriptionLimits";

// GET all menu items for a kitchen
export async function GET(request, { params }) {
    try {
        await dbConnect();

        // const kitchenId = await params.id;
        const { id: kitchenId } = await params;
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

        const { id: kitchenId } = params;

        // Verify kitchen ownership
        const kitchen = await Kitchen.findById(kitchenId);
        if (!kitchen || kitchen.ownerId.toString() !== user._id.toString()) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or unauthorized" 
            }), { status: 404 });
        }

        // Check menu item creation limits
        const menuLimits = await checkMenuItemLimit(kitchenId);
        if (!menuLimits.canCreate) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `Menu item limit reached for this kitchen. You can add up to ${menuLimits.max} items per kitchen. Currently: ${menuLimits.current}/${menuLimits.max}. Please upgrade your subscription to add more items.`,
                data: {
                    current: menuLimits.current,
                    max: menuLimits.max,
                    upgradeRequired: true
                }
            }), { status: 403 });
        }

        const menuItemData = await request.json();
        
        // Validate required fields
        const { name, description, price, category } = menuItemData;
        
        if (!name || !description || !price || !category) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Missing required fields" 
            }), { status: 400 });
        }

        const menuItem = new MenuItem({
            ...menuItemData,
            kitchenId,
            price: parseFloat(price)
        });

        await menuItem.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Menu item created successfully",
            data: { 
                menuItem,
                limits: {
                    current: menuLimits.current + 1,
                    max: menuLimits.max,
                    remaining: menuLimits.remaining - 1
                }
            }
        }), { status: 201 });

    } catch (error) {
        console.error("Error creating menu item:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}