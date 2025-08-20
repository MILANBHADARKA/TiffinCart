import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
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

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No image file provided" 
      }), { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "File must be an image" 
      }), { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Image size must be less than 5MB" 
      }), { status: 400 });
    }

    const uploadResult = await uploadImageToCloudinary(file);

    if (!uploadResult.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: uploadResult.error 
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      }
    }), { status: 200 });

  } catch (error) {
    console.error("Error in image upload route:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal server error" 
    }), { status: 500 });
  }
}
