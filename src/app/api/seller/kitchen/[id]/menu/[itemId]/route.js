import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id: kitchenId, itemId } = await params;
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

        const item = await MenuItem.findOne({ 
            _id: itemId,
            kitchenId
        }).lean();

        if (!item) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not found" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { item } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in menu item GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const { id: kitchenId, itemId } = await params;
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

        // Verify kitchen ownership
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        });

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        const updates = await request.json();
        
        // Prevent changing kitchenId
        delete updates.kitchenId;
        
        const updatedItem = await MenuItem.findOneAndUpdate(
            { _id: itemId, kitchenId },
            { $set: updates },
            { new: true }
        );

        if (!updatedItem) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not found" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: { item: updatedItem } 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in menu item PATCH route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect(); 

        const { id: kitchenId, itemId } = await params;
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

        // Verify kitchen ownership
        const kitchen = await Kitchen.findOne({ 
            _id: kitchenId, 
            ownerId: user._id 
        });

        if (!kitchen) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Kitchen not found or you don't have permission" 
            }), { status: 404 });
        }

        const deletedItem = await MenuItem.findOneAndDelete({ 
            _id: itemId, 
            kitchenId 
        });

        if (!deletedItem) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Menu item not found" 
            }), { status: 404 });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Menu item deleted successfully" 
        }), { status: 200 });

    } catch (error) {
        console.error("Error in menu item DELETE route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}