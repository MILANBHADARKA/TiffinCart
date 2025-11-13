import { resend } from "@/lib/resend";
import ContactNotificationEmail from "../../emails/ContactNotificationEmail";
import ContactConfirmationEmail from "../../emails/ContactConfirmationEmail";
import ContactStatusChangeEmail from "../../emails/ContactStatusChangeEmail";

export async function sendContactNotificationToAdmin(contactData) {
    try {
        if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
            throw new Error('Missing required data for sending contact notification');
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            throw new Error('ADMIN_EMAIL environment variable is not set');
        }

        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/contact`;

        const categoryLabels = {
            general: 'General Inquiry',
            order: 'Order Support',
            payment: 'Payment Help',
            seller: 'Become a Seller',
            technical: 'Technical Support',
            feedback: 'Feedback & Suggestions'
        };

        const { data, error } = await resend.emails.send({
            from: 'TifinCart Contact <notifications@themoneymate.xyz>',
            to: [adminEmail],
            replyTo: contactData.email,
            subject: `[TifinCart] New ${categoryLabels[contactData.category]} Message from ${contactData.name}`,
            react: ContactNotificationEmail({
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject,
                category: contactData.category,
                message: contactData.message,
                createdAt: contactData.createdAt || new Date(),
                dashboardUrl
            }),
        });

        if (error) {
            console.error('Error sending contact notification email to admin:', error);
            return { success: false, error: error.message };
        }

        console.log('Contact notification email sent to admin successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendContactNotificationToAdmin:', error);
        return { success: false, error: error.message };
    }
}

export async function sendContactConfirmationToCustomer(contactData) {
    try {
        if (!contactData.name || !contactData.email || !contactData.subject) {
            throw new Error('Missing required data for sending contact confirmation');
        }

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const { data, error } = await resend.emails.send({
            from: 'TifinCart Support <notifications@themoneymate.xyz>',
            to: [contactData.email],
            subject: `[TifinCart] We received your message - ${contactData.subject}`,
            react: ContactConfirmationEmail({
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject,
                category: contactData.category,
                message: contactData.message,
                createdAt: contactData.createdAt || new Date(),
                dashboardUrl
            }),
        });

        if (error) {
            console.error('Error sending contact confirmation email to customer:', error);
            return { success: false, error: error.message };
        }

        console.log('Contact confirmation email sent to customer successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendContactConfirmationToCustomer:', error);
        return { success: false, error: error.message };
    }
}

export async function sendContactStatusChangesMail(contactData, status, adminNotes = '') {
    try {
        if (!contactData.name || !contactData.email || !contactData.subject || !status) {
            throw new Error('Missing required data for sending contact status change notification');
        }

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const statusTexts = {
            'resolved': 'Resolved',
            'closed': 'Closed',
            'in-progress': 'In Progress'
        };

        const { data, error } = await resend.emails.send({
            from: 'TifinCart Support <notifications@themoneymate.xyz>',
            to: [contactData.email],
            subject: `[TifinCart] Your message "${contactData.subject}" has been ${statusTexts[status] || 'updated'}`,
            react: ContactStatusChangeEmail({
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject,
                category: contactData.category,
                message: contactData.message,
                status,
                adminNotes,
                createdAt: contactData.createdAt || new Date(),
                dashboardUrl
            }),
        });

        if (error) {
            console.error('Error sending contact status change email to customer:', error);
            return { success: false, error: error.message };
        }

        console.log('Contact status change email sent to customer successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Error in sendContactStatusChangesMail:', error);
        return { success: false, error: error.message };
    }
}
