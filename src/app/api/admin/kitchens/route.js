import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
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
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Unauthorized access" 
            }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = {};
        if (status) {
            query.status = status;
        }

        const kitchens = await Kitchen.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return new Response(JSON.stringify({ 
            success: true, 
            data: { kitchens }
        }), { status: 200 });

    } catch (error) {
        console.error("Error in admin kitchens GET route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}
