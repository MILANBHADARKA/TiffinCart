import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { checkKitchenLimit } from "@/lib/subscriptionLimits";
import { sendKitchenApprovalEmail } from "@/helper/sendAdminNotification";

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
        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({
                success: false,
                error: "Unauthorized access"
            }), { status: 403 });
        }

        // Check kitchen creation limits
        const kitchenLimits = await checkKitchenLimit(user._id);
        if (!kitchenLimits.canCreate) {
            return new Response(JSON.stringify({
                success: false,
                error: `Kitchen limit reached. You can create up to ${kitchenLimits.max} kitchens. Currently: ${kitchenLimits.current}/${kitchenLimits.max}. Please upgrade your subscription to create more kitchens.`,
                data: {
                    current: kitchenLimits.current,
                    max: kitchenLimits.max,
                    upgradeRequired: true
                }
            }), { status: 403 });
        }

        const kitchenData = await request.json();

        // Validate required fields
        const { 
            name, 
            description, 
            cuisine, 
            address, 
            contact, 
            license,
            deliveryInfo 
        } = kitchenData;

        // console.log('Received kitchen data:', kitchenData);

        if (!name || !description || !cuisine || !address || !contact || !license?.fssaiNumber) {
            return new Response(JSON.stringify({
                success: false,
                error: "Missing required fields: name, description, cuisine, address, contact, and FSSAI license are required"
            }), { status: 400 });
        }

        // Validate nested required fields
        if (!address.street || !address.city || !address.state || !address.zipCode) {
            return new Response(JSON.stringify({
                success: false,
                error: "Complete address is required (street, city, state, zipCode)"
            }), { status: 400 });
        }

        if (!contact.phone) {
            return new Response(JSON.stringify({
                success: false,
                error: "Contact phone is required"
            }), { status: 400 });
        }

        // Set default contact email if not provided
        if (!contact.email) {
            contact.email = user.email;
        }

        // Set default delivery info if not provided
        const defaultDeliveryInfo = {
            deliveryCharge: 30,
            minimumOrder: 100,
            freeDeliveryAbove: 500,
            maxDeliveryDistance: 10,
            ...deliveryInfo
        };

        const kitchen = new Kitchen({
            name,
            description,
            cuisine,
            address,
            contact,
            license,
            deliveryInfo: defaultDeliveryInfo,
            ownerId: user._id,
            status: 'pending' // Requires admin approval
        });

        // console.log('Creating kitchen with data:', kitchen);
        await kitchen.save();

        // Send notification email to admin for approval
        const emailResult = await sendKitchenApprovalEmail({kitchenData: kitchen, ownerDetails: { name: user.name, email: user.email }});
        if (!emailResult.success) {
            console.error('Failed to send kitchen approval email:', emailResult.error);
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Kitchen created successfully and submitted for review",
            data: {
                kitchen,
                limits: {
                    current: kitchenLimits.current + 1,
                    max: kitchenLimits.max,
                    remaining: kitchenLimits.remaining - 1
                }
            }
        }), { status: 201 });

    } catch (error) {
        console.error("Error in kitchen creation:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Internal server error"
        }), { status: 500 });
    }
}