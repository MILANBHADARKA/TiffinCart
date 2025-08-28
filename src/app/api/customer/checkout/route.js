import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Cart from "@/model/cart";
import Order from "@/model/order";
import MenuItem from "@/model/menuItem";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        await dbConnect();

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
        if (!user || user.role !== 'customer') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { deliveryAddress, paymentMethod } = await request.json();

        if (!deliveryAddress || !paymentMethod) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Delivery address and payment method are required" 
            }), { status: 400 });
        }

        // Get cart with populated items
        const cart = await Cart.findOne({ userId: user._id })
            .populate({
                path: 'items.menuItemId',
                populate: {
                    path: 'kitchenId',
                    select: 'name deliveryInfo ownerId'
                }
            });

        if (!cart || cart.items.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Cart is empty" 
            }), { status: 400 });
        }

        // Group items by kitchen
        const ordersByKitchen = {};
        
        cart.items.forEach(item => {
            const kitchenId = item.menuItemId.kitchenId._id.toString();
            if (!ordersByKitchen[kitchenId]) {
                ordersByKitchen[kitchenId] = {
                    kitchen: item.menuItemId.kitchenId,
                    items: [],
                    subtotal: 0
                };
            }
            ordersByKitchen[kitchenId].items.push(item);
            ordersByKitchen[kitchenId].subtotal += item.price * item.quantity;
        });

        const createdOrders = [];

        // Create separate orders for each kitchen
        for (const [kitchenId, orderData] of Object.entries(ordersByKitchen)) {
            const { kitchen, items, subtotal } = orderData;
            const deliveryInfo = kitchen.deliveryInfo;

            // Check minimum order value
            if (deliveryInfo.minimumOrder && subtotal < deliveryInfo.minimumOrder) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: `Minimum order value for ${kitchen.name} is ₹${deliveryInfo.minimumOrder}. Current: ₹${subtotal}` 
                }), { status: 400 });
            }

            // Calculate delivery fee
            let deliveryFee = deliveryInfo.deliveryCharge || 0;
            if (deliveryInfo.freeDeliveryAbove && subtotal >= deliveryInfo.freeDeliveryAbove) {
                deliveryFee = 0;
            }

            const tax = Math.round(subtotal * 0.05); // 5% tax
            const totalAmount = subtotal + deliveryFee + tax; 

            const order = new Order({
                customerId: user._id,
                sellerId: kitchen.ownerId,
                kitchenId: kitchen._id,
                items: items.map(item => ({
                    menuItemId: item.menuItemId._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    isVeg: item.isVeg
                })),
                deliveryAddress,
                paymentMethod,
                subtotal,
                deliveryFee,
                tax,
                totalAmount
            });

            await order.save();
            createdOrders.push(order);
        }

        // Clear the cart
        await Cart.findByIdAndDelete(cart._id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Orders placed successfully",
            data: { orders: createdOrders }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in checkout route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
