import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
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

        // Get all approved kitchens
        const kitchens = await Kitchen.find({ 
            status: 'approved',
            isActive: true
        }).lean();

        // Extract all unique cities and standardize case (Title Case)
        const cityMap = {};
        kitchens.forEach(kitchen => {
            if (kitchen.address && kitchen.address.city) {
                // Convert to title case (first letter capital, rest lowercase)
                const standardizedCity = kitchen.address.city
                    .trim()
                    .toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase());
                
                cityMap[standardizedCity] = true;
            }
        });
        const availableCities = Object.keys(cityMap).sort();

        // Format the response data
        const formattedKitchens = kitchens.map(kitchen => {
            // Standardize city case in the returned kitchen objects too
            let cityName = kitchen.address.city;
            if (cityName) {
                cityName = cityName.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            }

            return {
                id: kitchen._id,
                name: kitchen.name,
                description: kitchen.description,
                cuisine: kitchen.cuisine,
                address: {
                    city: cityName,
                    state: kitchen.address.state
                },
                rating: kitchen.ratings.average,
                totalReviews: kitchen.ratings.totalReviews,
                isOpen: kitchen.isCurrentlyOpen,
                deliveryTime: kitchen.deliveryInfo.estimatedDeliveryTime,
                minOrder: kitchen.deliveryInfo.minimumOrder,
                totalItems: 0, // This would need to be populated from a menu items count
                image: kitchen.images && kitchen.images.length > 0 ? kitchen.images[0] : null
            };
        });

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchens: formattedKitchens, availableCities }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchens GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
