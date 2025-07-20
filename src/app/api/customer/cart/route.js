import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET() {
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        let cart = await Cart.findOne({ customerId: user._id })
            .populate('items.menuItemId', 'name description category isAvailable')
            .populate('items.sellerId', 'name email');

        if (!cart) {
            cart = new Cart({ 
                customerId: user._id, 
                items: [], 
                totalAmount: 0 
            });
            await cart.save();
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { cart }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { menuItemId, quantity = 1, specialInstructions = '' } = await request.json();

        if (!menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required" 
            }), { status: 400 });
        }

        const menuItem = await MenuItem.findById(menuItemId).populate('sellerId', 'name');
        if (!menuItem || !menuItem.isAvailable) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not available" 
            }), { status: 404 });
        }

        let cart = await Cart.findOne({ customerId: user._id });
        if (!cart) {
            cart = new Cart({ customerId: user._id, items: [] });
        }

        if (cart.items.length > 0) {
            const existingSellerId = cart.items[0].sellerId.toString();
            if (existingSellerId !== menuItem.sellerId._id.toString()) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "Cannot add items from different restaurants. Please clear your cart first." 
                }), { status: 400 });
            }
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.menuItemId.toString() === menuItemId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                menuItemId: menuItem._id,
                sellerId: menuItem.sellerId._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                specialInstructions
            });
        }

        await cart.save();

        await cart.populate('items.menuItemId', 'name description category isAvailable');
        await cart.populate('items.sellerId', 'name email');

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Item added to cart",
            data: { cart }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart POST route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { menuItemId, quantity, specialInstructions } = await request.json();

        if (!menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required" 
            }), { status: 400 });
        }

        const cart = await Cart.findOne({ customerId: user._id });
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
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found" 
            }), { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        const cart = await Cart.findOne({ customerId: user._id });
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
