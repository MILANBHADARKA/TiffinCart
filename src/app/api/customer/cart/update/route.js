import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function PATCH(request) {
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

        const { itemId, quantity } = await request.json();

        if (!itemId || !quantity || quantity < 1) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Invalid request data" 
            }), { status: 400 });
        }

        // Find the cart
        const cart = await Cart.findOne({ userId: user._id });
        
        if (!cart) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Cart not found" 
            }), { status: 404 });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === itemId);
        
        if (itemIndex === -1) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Item not found in cart" 
            }), { status: 404 });
        }

        // Update the quantity
        cart.items[itemIndex].quantity = quantity;
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
        console.error("Error in cart update route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
