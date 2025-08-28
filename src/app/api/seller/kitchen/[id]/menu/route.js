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

        const kitchenId = await params.id;
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

        // Verify kitchen ownership
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        });

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or unauthorized" 
            }), { status: 404 });
        }

        const {
            name,
            description,
            price,
            category,
            isVeg,
            spiciness,
            ingredients,
            image,
            imagePublicId,
            servingSize,
            isAvailable
            // REMOVED: deliveryCharge, freeDeliveryAbove, advanceOrderHours
        } = await request.json();

        // Validation
        if (!name || !description || !price || !category) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Name, description, price, and category are required" 
            }), { status: 400 });
        }

        const menuItem = new MenuItem({
            kitchenId,
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category,
            isVeg: Boolean(isVeg),
            spiciness: spiciness || 'medium',
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            image: image || '',
            imagePublicId: imagePublicId || '',
            servingSize: servingSize || '1 person',
            isAvailable: Boolean(isAvailable)
            // REMOVED: deliveryInfo field
        });

        await menuItem.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Menu item added successfully",
            data: { menuItem }
        }), { status: 201 });

    } catch (error) {
        console.error("Error adding menu item:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
