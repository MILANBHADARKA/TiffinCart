import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import Order from "@/model/order";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

// Create a new order
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

        const { address, paymentMethod } = await request.json();

        if (!address) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Delivery address is required" 
            }), { status: 400 });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId: user._id });
        
        if (!cart || cart.items.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Your cart is empty" 
            }), { status: 400 });
        }

        // Group items by kitchen
        const kitchenItems = {};
        
        for (const item of cart.items) {
            const kitchenId = item.kitchenId.toString();
            if (!kitchenItems[kitchenId]) {
                kitchenItems[kitchenId] = [];
            }
            kitchenItems[kitchenId].push(item);
        }

        const orders = [];

        // Create order for each kitchen
        for (const kitchenId in kitchenItems) {
            const items = kitchenItems[kitchenId];
            
            // Get kitchen details
            const kitchen = await Kitchen.findById(kitchenId);
            if (!kitchen) {
                continue; // Skip if kitchen not found
            }

            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const deliveryFee = 40; // Fixed delivery fee
            const tax = subtotal * 0.05; // 5% tax
            const totalAmount = subtotal + deliveryFee + tax;

            // Create order
            const order = new Order({
                customerId: user._id,
                sellerId: kitchen.ownerId,
                kitchenId,
                items,
                deliveryAddress: address,
                paymentMethod: paymentMethod || 'cash',
                subtotal,
                deliveryFee,
                tax,
                totalAmount
            });

            await order.save();
            orders.push(order);
        }

        if (orders.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Failed to create orders" 
            }), { status: 500 });
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { 
                message: "Order placed successfully",
                orderId: orders[0]._id, // Return first order ID for redirect
                orderCount: orders.length
            }
        }), { status: 201 });

    } catch (error) {
        console.error("Error in order creation:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

// Get customer orders
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

        // Get orders for this customer
        const orders = await Order.find({ customerId: user._id })
            .sort({ createdAt: -1 }) // Most recent first
            .populate('kitchenId', 'name cuisine')
            .lean();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { orders }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in orders GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
