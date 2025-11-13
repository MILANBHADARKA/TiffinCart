import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import { verifyToken } from '@/lib/jwt';
import User from '@/model/user';
import ContactMessage from '@/models/ContactMessage';
import { sendContactNotificationToAdmin, sendContactConfirmationToCustomer, sendContactStatusChangesMail } from '@/helper/sendContactEmails';
import rateLimit from '@/lib/rateLimit';

// Rate limiting: 5 requests per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'anonymous';

    // Apply rate limiting
    try {
      await limiter.check(5, ip); // 5 requests per interval
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, email, subject, category, message } = body;

    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required.' 
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide a valid email address.' 
        },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message must be at least 10 characters long.' 
        },
        { status: 400 }
      );
    }

    const validCategories = ['general', 'order', 'payment', 'seller', 'technical', 'feedback'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid category selected.' 
        },
        { status: 400 }
      );
    }
0
    let userId = null;
    let authenticatedUser = null;
    
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token');

      if (token) {
        const decoded = verifyToken(token.value);
        if (decoded) {
          authenticatedUser = await User.findById(decoded.id);
          if (authenticatedUser) {
            userId = authenticatedUser._id;
          }
        }
      }
    } catch (authError) {
      // Authentication is optional for contact form, so we continue without user info
      console.log('Authentication check failed (optional):', authError.message);
    }

    // Create contact message
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category,
      message: message.trim(),
      userId, // Will be null if user is not authenticated
      // Set priority based on category
      priority: category === 'order' ? 'high' : 
               category === 'payment' ? 'high' : 
               category === 'technical' ? 'medium' : 'low'
    };

    const contactMessage = new ContactMessage(contactData);
    const savedMessage = await contactMessage.save();

    // Add creation date to contact data for emails
    const emailContactData = {
      ...contactData,
      createdAt: savedMessage.createdAt
    };

    // Send emails asynchronously (don't wait for them to complete)
    Promise.all([
      sendContactNotificationToAdmin(emailContactData),
      sendContactConfirmationToCustomer(emailContactData)
    ]).then(([adminResult, customerResult]) => {
      console.log('Email notifications sent:', {
        admin: adminResult.success,
        customer: customerResult.success,
        adminError: adminResult.error || null,
        customerError: customerResult.error || null,
        userId: userId ? userId.toString() : 'guest'
      });
    }).catch((error) => {
      console.error('Failed to send email notifications:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        id: savedMessage._id,
        status: savedMessage.status,
        priority: savedMessage.priority,
        createdAt: savedMessage.createdAt,
        isAuthenticated: !!userId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed.',
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    // Handle duplicate email submissions (if we add unique constraints)
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'A message with this email was recently submitted. Please wait before sending another.' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve contact messages (for admin panel)
export async function GET(request) {
  try {
    // Authenticate admin user using cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No token found' 
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized access. Admin privileges required.' 
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');

    // Build query
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await ContactMessage.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactMessage.countDocuments(query);

    // Get statistics
    const stats = {
      total: await ContactMessage.countDocuments(),
      pending: await ContactMessage.countDocuments({ status: 'pending' }),
      resolved: await ContactMessage.countDocuments({ status: 'resolved' }),
      highPriority: await ContactMessage.countDocuments({ priority: 'high' }),
      categories: await ContactMessage.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    };

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch messages.' 
      },
      { status: 500 }
    );
  }
}

// (for admin)
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No token found' 
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized access. Admin privileges required.' 
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const { messageId, status, adminNotes, priority } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message ID is required' 
        },
        { status: 400 }
      );
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = user._id;
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role')
     .populate('resolvedBy', 'name email');

    if (!updatedMessage) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message not found' 
        },
        { status: 404 }
      );
    }

    //if status change to resolved or closed, send confirmation email to customer
    if (status === 'resolved' || status === 'closed') {
      const contactData = {
        name: updatedMessage.name,
        email: updatedMessage.email,
        subject: updatedMessage.subject,
        category: updatedMessage.category,
        message: updatedMessage.message,
        createdAt: updatedMessage.createdAt
      };
      
      sendContactStatusChangesMail(contactData, status, adminNotes || '')
        .then(result => {
          if (result.success) {
            console.log('Resolution confirmation email sent to customer successfully');
          }
          else {
            console.error('Failed to send resolution confirmation email to customer:', result.error);
          }
        })
        .catch(error => {
          console.error('Error sending resolution confirmation email to customer:', error);
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Failed to update contact message:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update message.' 
      },
      { status: 500 }
    );
  }
}
