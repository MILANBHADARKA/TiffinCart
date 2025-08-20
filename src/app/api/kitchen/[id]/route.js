import dbConnect from "@/lib/dbConnect";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const kitchenId = params.id;

        // Find the kitchen - no auth required for viewing
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId,
            status: 'approved',
            isActive: true
        }).lean();

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found" 
            }), { status: 404 });
        }

        // Count menu items for this kitchen
        const itemCount = await MenuItem.countDocuments({ 
            kitchenId: kitchenId,
            isAvailable: true 
        });

        // Add the item count to the kitchen data
        const kitchenWithItemCount = {
            ...kitchen,
            totalItems: itemCount
        };

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchen: kitchenWithItemCount } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in kitchen details GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
