import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import MenuItem from "@/model/menuItem";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

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

        const cart = await Cart.findOne({ userId: user._id })
            .populate({
                path: 'items.menuItemId',
                populate: {
                    path: 'kitchenId',
                    select: 'name deliveryInfo'
                }
            });

        if (!cart || cart.items.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                data: { 
                    cart: {
                        items: [],
                        subtotal: 0,
                        deliveryFee: 0,
                        total: 0,
                        kitchenDeliveries: []
                    }
                }
            }), { status: 200 });
        }

        // Filter out items where menuItem or kitchen might be null
        const validItems = cart.items.filter(item => 
            item.menuItemId && 
            item.menuItemId.kitchenId && 
            item.menuItemId.kitchenId.deliveryInfo
        );

        if (validItems.length === 0) {
            return new Response(JSON.stringify({ 
                success: true, 
                data: { 
                    cart: {
                        items: [],
                        subtotal: 0,
                        deliveryFee: 0,
                        total: 0,
                        kitchenDeliveries: []
                    }
                }
            }), { status: 200 });
        }

        // Group items by kitchen to calculate delivery fees
        const itemsByKitchen = {};
        validItems.forEach(item => {
            const kitchenId = item.menuItemId.kitchenId._id.toString();
            if (!itemsByKitchen[kitchenId]) {
                itemsByKitchen[kitchenId] = {
                    kitchen: item.menuItemId.kitchenId,
                    items: [],
                    subtotal: 0
                };
            }
            itemsByKitchen[kitchenId].items.push(item);
            itemsByKitchen[kitchenId].subtotal += item.price * item.quantity;
        });

        // Calculate delivery fees per kitchen
        let totalDeliveryFee = 0;
        const kitchenDeliveries = [];

        Object.values(itemsByKitchen).forEach(kitchenGroup => {
            const { kitchen, subtotal } = kitchenGroup;
            const deliveryInfo = kitchen.deliveryInfo || {};
            
            let deliveryFee = deliveryInfo.deliveryCharge || 0;
            
            // Check for free delivery
            if (deliveryInfo.freeDeliveryAbove && subtotal >= deliveryInfo.freeDeliveryAbove) {
                deliveryFee = 0;
            }
            
            totalDeliveryFee += deliveryFee;
            kitchenDeliveries.push({
                kitchenId: kitchen._id,
                kitchenName: kitchen.name,
                subtotal,
                deliveryFee,
                minimumOrder: deliveryInfo.minimumOrder || 0
            });
        });

        const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + totalDeliveryFee;

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                cart: {
                    items: validItems,
                    subtotal,
                    deliveryFee: totalDeliveryFee,
                    total,
                    kitchenDeliveries
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

        const { menuItemId, quantity = 1, clearCart = false } = await request.json();

        if (!menuItemId) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item ID is required" 
            }), { status: 400 });
        }

        // Get menu item with kitchen info
        const menuItem = await MenuItem.findById(menuItemId)
            .populate('kitchenId', 'name deliveryInfo isCurrentlyOpen');

        if (!menuItem) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not found" 
            }), { status: 404 });
        }

        if (!menuItem.isAvailable) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item is not available" 
            }), { status: 400 });
        }

        if (!menuItem.kitchenId.isCurrentlyOpen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen is currently closed" 
            }), { status: 400 });
        }

        // Clean up any invalid cart entries first (carts with null userId)
        await Cart.deleteMany({ userId: null });

        // Find or create cart
        let cart = await Cart.findOne({ userId: user._id });
        
        if (!cart) {
            cart = new Cart({ 
                userId: user._id, 
                items: []
            });
        }

        // Check if cart has items from different kitchen
        if (cart.items.length > 0 && !clearCart) {
            const existingKitchenId = cart.items[0].kitchenId.toString();
            const newKitchenId = menuItem.kitchenId._id.toString();
            
            if (existingKitchenId !== newKitchenId) {
                const existingKitchen = await Kitchen.findById(existingKitchenId).select('name');
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "DIFFERENT_KITCHEN",
                    data: {
                        existingKitchenName: existingKitchen?.name || 'Unknown Kitchen',
                        newKitchenName: menuItem.kitchenId.name
                    }
                }), { status: 400 });
            }
        }

        if (clearCart) {
            cart.items = [];
        }
        
        // already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.menuItemId.toString() === menuItemId
        );
        
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                menuItemId,
                kitchenId: menuItem.kitchenId._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                isVeg: menuItem.isVeg
            });
        }
        
        await cart.save();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Item added to cart"
        }), { status: 200 });

    } catch (error) {
        console.error("Error in cart POST route:", error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
            // Clean up invalid carts and retry
            try {
                await Cart.deleteMany({ userId: null });
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "Cart conflict resolved. Please try again." 
                }), { status: 409 });
            } catch (cleanupError) {
                console.error("Error cleaning up carts:", cleanupError);
            }
        }

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
