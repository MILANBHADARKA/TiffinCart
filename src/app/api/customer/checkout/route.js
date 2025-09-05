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

        // Group items by kitchen AND meal category
        const ordersByKitchenAndCategory = {};
        
        cart.items.forEach(item => {
            const kitchenId = item.menuItemId.kitchenId._id.toString();
            const category = item.menuItemId.category; // breakfast, lunch, dinner
            const orderKey = `${kitchenId}_${category}`;
            
            if (!ordersByKitchenAndCategory[orderKey]) {
                ordersByKitchenAndCategory[orderKey] = {
                    kitchen: item.menuItemId.kitchenId,
                    category: category,
                    items: [],
                    subtotal: 0
                };
            }
            ordersByKitchenAndCategory[orderKey].items.push(item);
            ordersByKitchenAndCategory[orderKey].subtotal += item.price * item.quantity;
        });

        const createdOrders = [];

        // separate orders for each kitchen-category
        for (const [orderKey, orderData] of Object.entries(ordersByKitchenAndCategory)) {
            const { kitchen, category, items, subtotal } = orderData;
            const deliveryInfo = kitchen.deliveryInfo;

            // minimum order value
            const kitchenId = kitchen._id.toString();
            const totalKitchenSubtotal = Object.entries(ordersByKitchenAndCategory)
                .filter(([key]) => key.startsWith(`${kitchenId}_`))
                .reduce((total, [, data]) => total + data.subtotal, 0);

            if (deliveryInfo.minimumOrder && totalKitchenSubtotal < deliveryInfo.minimumOrder) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: `Minimum order value for ${kitchen.name} is ₹${deliveryInfo.minimumOrder}. Current total: ₹${totalKitchenSubtotal}` 
                }), { status: 400 });
            }

            // Calculate delivery fee
            const categoriesFromKitchen = Object.keys(ordersByKitchenAndCategory)
                .filter(key => key.startsWith(`${kitchenId}_`)).length;
            
            let deliveryFee = deliveryInfo.deliveryCharge || 0;
            if (deliveryInfo.freeDeliveryAbove && totalKitchenSubtotal >= deliveryInfo.freeDeliveryAbove) {
                deliveryFee = 0;
            }
            
            const splitDeliveryFee = deliveryFee;

            const tax = Math.round(subtotal * 0.05); // 5% tax
            const totalAmount = subtotal + splitDeliveryFee + tax; 

            // Set delivery date based on meal category
            const now = new Date();
            let deliveryDate = new Date(now);
            
            // For breakfast, if ordered after 8 PM, deliver next day
            if (category === 'Breakfast' && now.getHours() >= 20) {
                deliveryDate.setDate(deliveryDate.getDate() + 1);
            }
            
            // Set delivery time windows
            let deliveryTimeWindow = '';
            switch(category) {
                case 'Breakfast':
                    deliveryTimeWindow = '7:00 AM - 10:00 AM';
                    break;
                case 'Lunch':
                    deliveryTimeWindow = '12:00 PM - 3:00 PM';
                    break;
                case 'Dinner':
                    deliveryTimeWindow = '7:00 PM - 10:00 PM';
                    break;
            }

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
                deliveryFee: splitDeliveryFee,
                tax,
                totalAmount,
                mealCategory: category, // Add meal category to order
                deliveryDate: deliveryDate,
                deliveryTimeWindow: deliveryTimeWindow,
                orderDeadlinePassed: false // Will be checked before preparation
            });

            await order.save();
            createdOrders.push(order);
        }

        // Clear the cart
        await Cart.findByIdAndDelete(cart._id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `${createdOrders.length} order(s) placed successfully`,
            data: { 
                orders: createdOrders,
                totalOrders: createdOrders.length,
                ordersByCategory: createdOrders.reduce((acc, order) => {
                    acc[order.mealCategory] = (acc[order.mealCategory] || 0) + 1;
                    return acc;
                }, {})
            }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in checkout route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
