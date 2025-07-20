import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { newKitchenApprovalEmail } from "@/helper/newKitchenApprovalEmail";
import { cloudinary } from "@/lib/cloudinary";


export async function POST(req) {
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

        const { name, description, address, contact, operatingHours } = await req.json();

        const { street, city, state, zipCode } = address;
        const { phone, email } = contact;
        const { morning, afternoon, evening } = operatingHours;

        const kitchenPictures = req.files?.kitchenPictures || [];

        if (!name || !description || !street || !city || !state || !zipCode || !phone || !email) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "All fields are required" 
            }), { status: 400 });
        }

        const existingKitchenWithNameInSameCity = await Kitchen.findOne({
            name,
            'address.city': city,
        });

        if (existingKitchenWithNameInSameCity) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "A kitchen with this name already exists in the same city" 
            }), { status: 400 });
        }

        const uploadedPictures = [];

        for (const picture of kitchenPictures) {
            const uploadResult = await cloudinary.uploader.upload(picture.path, {
                folder: 'kitchens',
                resource_type: 'image'
            });

            if (uploadResult.error) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: "Failed to upload kitchen pictures" 
                }), { status: 500 });
            }

            uploadedPictures.push(uploadResult.secure_url);
        }

        const kitchen = new Kitchen({
            ownerId: user._id,
            ownerName: user.name,
            name,
            description,
            address: {
                street,
                city,
                state,
                zipCode
            },
            contact: {
                phone,
                email
            },
            images: uploadedPictures,
            operatingHours: {
                morning: {
                    open: morning.open,
                    close: morning.close
                },
                afternoon: {
                    open: afternoon.open,
                    close: afternoon.close
                },
                evening: {
                    open: evening.open,
                    close: evening.close
                }
            }
        });
        await kitchen.save();

        const adminEmail = process.env.ADMIN_EMAIL;
        const emailSent = await newKitchenApprovalEmail({
            adminEmail,
            kitchenId: kitchen._id,
            kitchenName: kitchen.name,
            kitchenDescription: kitchen.description
        });

        if (!emailSent.success) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: emailSent.error 
            }), { status: 500 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Kitchen created successfully and approval email sent" 
        }), { status: 201 });
        
    } catch (error) {
        console.error("Error in kitchen status update route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }

}