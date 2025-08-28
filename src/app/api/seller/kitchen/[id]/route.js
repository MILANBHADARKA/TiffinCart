import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { cloudinary } from "@/lib/cloudinary";


export async function GET(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = await params.id;
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

        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        }).lean();

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchen } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return new Response(JSON.stringify({
                success: false,
                error: "No token found"
        }, { status: 401 }));
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid token"
        }, { status: 401 }));
        }

        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'seller') {
            return new Response(JSON.stringify({
                success: false,
                error: "Unauthorized access"
        }, { status: 403 }));
        }

        const { id } = await params;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: "Kitchen ID is required"
            }), { status: 400 });
        }

        const kitchen = await Kitchen.findById(id);

        if (!kitchen) {
            return new Response(JSON.stringify({
                success: false,
                error: "Kitchen not found"
            }), { status: 404 });
        }

        if (kitchen.ownerId.toString() !== user._id.toString()) {
            return new Response(JSON.stringify({
                success: false,
                error: "You are not authorized to update this kitchen"
            }), { status: 403 });
        }

        if (!kitchen) {
            return new Response(JSON.stringify({
                success: false,
                error: "Kitchen not found"
            }), { status: 404 });
        }

        const body = await req.json();


        const updatedData = {
            name: body.name || kitchen.name,
            description: body.description || kitchen.description,
            address: {
                street: body.address?.street || kitchen.address.street,
                city: body.address?.city || kitchen.address.city,
                state: body.address?.state || kitchen.address.state,
                zipCode: body.address?.zipCode || kitchen.address.zipCode
            },
            contact: {
                phone: body.contact?.phone || kitchen.contact.phone,
                email: body.contact?.email || kitchen.contact.email
            },
            isCurrentlyOpen: body.isCurrentlyOpen === 'True'
        };

        const kitchenPictures = req.files?.kitchenPictures || [];

        if (kitchenPictures.length > 0) {
            const uploadedPictures = await Promise.all(kitchenPictures.map(async (file) => {
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    folder: 'kitchens',
                    resource_type: 'image'
                });
                return uploadResult.secure_url;
            }));

            updatedData.pictures = uploadedPictures;
        }

        const updatedKitchen = await Kitchen.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedKitchen) {
            return new Response(JSON.stringify({
                success: false,
                error: "Failed to update kitchen"
            }), { status: 500 });
        }


        return new Response(JSON.stringify({
            success: true,
            message: "Kitchen updated successfully"
        }), { status: 200 });
    }
    catch (error) {
        console.error("Error in kitchen status update route:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Internal server error"
        }), { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const kitchenId = await params.id;
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

        const updates = await request.json();

        console.log("Received Updates:", updates);
        
        // Enhanced fields that are allowed to be updated by seller
        const allowedUpdates = [
            'name', 
            'description', 
            'cuisine', 
            'operatingHours',
            'contact',
            'isCurrentlyOpen',
            'deliveryInfo',
            'images',
            'address'
        ];
        
        // Filter out updates that aren't allowed
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        console.log("Filtered Updates:", filteredUpdates);
        
        const kitchen = await Kitchen.findOneAndUpdate(
            { _id: kitchenId, ownerId: user._id },
            { $set: filteredUpdates },
            { new: true }
        );

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Kitchen updated successfully",
            data: { kitchen } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen PATCH route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}