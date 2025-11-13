import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from '@react-email/components';

export default function ContactConfirmationEmail({ 
  name, 
  email, 
  subject,
  category,
  message,
  createdAt = new Date(),
  dashboardUrl = 'https://tifincart.com'
}) {
  const categoryLabels = {
    general: 'General Inquiry',
    order: 'Order Support',
    payment: 'Payment Help',
    seller: 'Become a Seller',
    technical: 'Technical Support',
    feedback: 'Feedback & Suggestions'
  };

  const categoryIcons = {
    general: '💬',
    order: '📦',
    payment: '💳',
    seller: '🏪',
    technical: '🔧',
    feedback: '⭐'
  };

  const isUrgent = category === 'order' || category === 'payment';
  const responseTime = isUrgent ? '2-4 hours' : '24 hours';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Message Received - TifinCart</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Thank you for contacting TifinCart - We'll get back to you soon!</Preview>
      <Section style={{ backgroundColor: '#f8fafc', padding: '40px 20px' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'white',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}
            >
              ✅
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              Message Received! 🎉
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              We'll get back to you soon
            </Text>
          </div>

          <div style={{ padding: '40px 20px' }}>
            <Row>
              <Heading
                as="h2"
                style={{
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                }}
              >
                Hello {name}! 👋
              </Heading>
            </Row>
            
            <Row>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                }}
              >
                Thank you for reaching out to TifinCart! We've successfully received your message regarding "<strong>{subject}</strong>" and our team will review it shortly.
              </Text>
            </Row>

            {/* Message Summary */}
            <div
              style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: '#92400e',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}
              >
                📋 Your Message Summary
              </Heading>
              
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ 
                  color: '#92400e', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Category: {categoryIcons[category]} {categoryLabels[category]}
                </Text>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ 
                  color: '#92400e', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Subject: {subject}
                </Text>
              </div>
              
              <div>
                <Text style={{ 
                  color: '#92400e', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Received: {new Date(createdAt).toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </Text>
              </div>
            </div>

            {/* What Happens Next */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h4"
                style={{
                  color: '#065f46',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                ⏱️ What Happens Next?
              </Heading>
              
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                • <strong>Response Time:</strong> We typically respond within {responseTime} during business days
              </Text>
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                • <strong>Business Hours:</strong> Monday - Saturday, 9 AM - 8 PM IST
              </Text>
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                • <strong>Updates:</strong> We'll send any updates to this email address: {email}
              </Text>
              {isUrgent && (
                <Text style={{ color: '#dc2626', fontSize: '14px', margin: '6px 0', fontWeight: 'bold' }}>
                  • <strong>Priority:</strong> Your {categoryLabels[category].toLowerCase()} request has high priority
                </Text>
              )}
            </div>

            {/* Quick Links */}
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h4"
                style={{
                  color: '#1d4ed8',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                🚀 While You Wait, Explore:
              </Heading>
              
              <Text style={{ color: '#1e40af', fontSize: '14px', margin: '6px 0' }}>
                • <a href={`${dashboardUrl}/kitchens`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>Browse our delicious tiffin kitchens</a>
              </Text>
              <Text style={{ color: '#1e40af', fontSize: '14px', margin: '6px 0' }}>
                • <a href={`${dashboardUrl}/contact-us`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>Check our FAQ section</a>
              </Text>
              {category === 'seller' && (
                <Text style={{ color: '#1e40af', fontSize: '14px', margin: '6px 0' }}>
                  • <a href={`${dashboardUrl}/seller/sign-up`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>Learn more about becoming a seller</a>
                </Text>
              )}
              <Text style={{ color: '#1e40af', fontSize: '14px', margin: '6px 0' }}>
                • <a href={`mailto:${process.env.ADMIN_EMAIL || 'support@tifincart.com'}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>Email us directly for urgent matters</a>
              </Text>
            </div>

            {/* Browse Button */}
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <a
                href={`${dashboardUrl}/kitchens`}
                style={{
                  backgroundColor: '#f97316',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline-block',
                }}
              >
                🍱 Browse Tiffin Options
              </a>
            </div>

            <Row>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                We appreciate your patience and look forward to helping you with your TifinCart experience!
              </Text>
            </Row>

            <Text
              style={{
                color: '#374151',
                fontSize: '16px',
                marginTop: '20px',
              }}
            >
              Best regards,<br />
              <strong>The TifinCart Team</strong> 🍱
            </Text>

            <div
              style={{
                backgroundColor: isUrgent ? '#fef2f2' : '#f0f9ff',
                borderLeft: `4px solid ${isUrgent ? '#dc2626' : '#3b82f6'}`,
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: isUrgent ? '#dc2626' : '#1d4ed8',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                💡 {isUrgent 
                  ? 'We understand your urgency and our priority team is on it!' 
                  : 'Pro tip: Join our community of satisfied customers enjoying homemade tiffins daily!'}
              </Text>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              padding: '24px 20px',
              textAlign: 'center',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <Text
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '0 0 8px',
              }}
            >
              Thank you for choosing TifinCart! 🙏<br />
              Supporting local food businesses, one tiffin at a time.
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. This is an automated confirmation email.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
