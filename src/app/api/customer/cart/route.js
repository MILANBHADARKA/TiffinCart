import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import MenuItem from "@/model/menuItem";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

// GET cart contents
export async function GET(request) {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        // Get or create cart
        let cart = await Cart.findOne({ userId: user._id });
        
        if (!cart) {
            cart = new Cart({ userId: user._id, items: [] });
            await cart.save();
        }

        // Calculate total
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                cart: {
                    items: cart.items,
                    total
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Add item to cart
export async function POST(request) {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { menuItemId, quantity = 1 } = await request.json();

        if (!menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required" 
            }), { status: 400 });
        }

        // Check if the menu item exists and is available
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not found" 
            }), { status: 404 });
        }

        if (!menuItem.isAvailable) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "This item is currently unavailable" 
            }), { status: 400 });
        }

        // Check if the kitchen is open
        const kitchen = await Kitchen.findById(menuItem.kitchenId);
        if (!kitchen || !kitchen.isCurrentlyOpen || kitchen.status !== 'approved') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "The kitchen is currently closed or not available" 
            }), { status: 400 });
        }

        // Get or create cart
        let cart = await Cart.findOne({ userId: user._id });
        
        if (!cart) {
            cart = new Cart({ userId: user._id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.menuItemId.toString() === menuItemId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if it doesn't exist
            cart.items.push({
                menuItemId,
                kitchenId: menuItem.kitchenId,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                image: menuItem.image,
                isVeg: menuItem.isVeg
            });
        }

        await cart.save();

        // Calculate total
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                cart: {
                    items: cart.items,
                    total
                }
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart POST route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Update cart item
export async function PUT(request) {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { menuItemId, quantity, specialInstructions } = await request.json();

        if (!menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required" 
            }), { status: 400 });
        }

        const cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Cart not found" 
            }), { status: 404 });
        }

        const itemIndex = cart.items.findIndex(
            item => item.menuItemId.toString() === menuItemId
        );

        if (itemIndex === -1) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Item not found in cart" 
            }), { status: 404 });
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
            if (specialInstructions !== undefined) {
                cart.items[itemIndex].specialInstructions = specialInstructions;
            }
        }

        await cart.save();

        await cart.populate('items.menuItemId', 'name description category isAvailable');
        await cart.populate('items.sellerId', 'name email');

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Cart updated",
            data: { cart }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart PUT route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Delete cart item or clear cart
export async function DELETE(request) {
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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        const cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Cart not found" 
            }), { status: 404 });
        }

        if (itemId) {
            cart.items = cart.items.filter(item => item.menuItemId.toString() !== itemId);
        } else {
            cart.items = [];
        }

        await cart.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: itemId ? "Item removed from cart" : "Cart cleared",
            data: { cart }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart DELETE route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
