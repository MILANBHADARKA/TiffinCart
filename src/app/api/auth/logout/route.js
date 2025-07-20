import { clearTokenCookie } from "@/lib/cookies";

export async function POST() {
    try {
        const cookie = clearTokenCookie();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Logout successful" 
        }), {
            status: 200,
            headers: {
                "Set-Cookie": cookie,
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        console.error("Error in logout route:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Internal server error" 
        }), { status: 500 });
    }
}