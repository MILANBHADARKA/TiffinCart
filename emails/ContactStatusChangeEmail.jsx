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

export default function ContactStatusChangeEmail({ 
  name, 
  email, 
  subject,
  category,
  message,
  status,
  adminNotes,
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

  const isResolved = status === 'resolved';
  const isClosed = status === 'closed';
  
  const statusText = isResolved ? 'resolved' : isClosed ? 'closed' : 'updated';
  const statusIcon = isResolved ? '✅' : isClosed ? '🔒' : '📋';
  const statusColor = isResolved ? '#22c55e' : isClosed ? '#6b7280' : '#f59e0b';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Contact Message Update - TifinCart</title>
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
      <Preview>Your message "{subject}" has been {statusText} - TifinCart</Preview>
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
              background: isResolved 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : isClosed 
                  ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
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
              {statusIcon}
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              Message {statusText.charAt(0).toUpperCase() + statusText.slice(1)}!
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              Update on your inquiry
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
                We have an update regarding your message "{subject}" that you sent to TifinCart.
              </Text>
            </Row>

            {/* Status Update */}
            <div
              style={{
                backgroundColor: isResolved ? '#ecfdf5' : isClosed ? '#f9fafb' : '#fef3c7',
                border: `2px solid ${statusColor}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: statusColor,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                {statusIcon} Your Message has been {statusText.toUpperCase()}
              </Heading>
              
              <Text style={{ 
                color: statusColor, 
                fontSize: '16px', 
                margin: '0',
                fontWeight: '500'
              }}>
                {isResolved 
                  ? 'Great news! We have resolved your inquiry and provided a solution.'
                  : isClosed
                    ? 'Your message has been processed and is now closed.'
                    : 'Your message status has been updated.'}
              </Text>
            </div>

            {/* Original Message Details */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: '#1f2937',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}
              >
                📋 Your Original Message
              </Heading>
              
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ 
                  color: '#374151', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Category: {categoryIcons[category]} {categoryLabels[category]}
                </Text>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ 
                  color: '#374151', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Subject: {subject}
                </Text>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ 
                  color: '#374151', 
                  fontSize: '14px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  Submitted: {new Date(createdAt).toLocaleDateString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'full'
                  })}
                </Text>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  marginTop: '16px'
                }}
              >
                <Text style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  margin: '0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  <strong>Your Message:</strong><br />
                  {message}
                </Text>
              </div>
            </div>

            {/* Admin Response */}
            {adminNotes && (
              <div
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  as="h3"
                  style={{
                    color: '#1d4ed8',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  💬 Our Response
                </Heading>
                
                <Text style={{ 
                  color: '#1e40af', 
                  fontSize: '16px', 
                  margin: '0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {adminNotes}
                </Text>
              </div>
            )}

            {/* Next Steps */}
            {isResolved && (
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
                  🎉 Issue Resolved!
                </Heading>
                
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • Your inquiry has been successfully resolved
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • If you need further assistance, feel free to contact us again
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • Thank you for choosing TifinCart!
                </Text>
              </div>
            )}

            {isClosed && (
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  as="h4"
                  style={{
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  📋 Message Closed
                </Heading>
                
                <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                  • Your message has been processed and closed
                </Text>
                <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                  • If you need further assistance, please submit a new message
                </Text>
                <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                  • We appreciate your patience and understanding
                </Text>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`${dashboardUrl}/contact-us`}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'inline-block',
                    margin: '4px'
                  }}
                >
                  Contact Us Again
                </a>
                
                <a
                  href={`${dashboardUrl}/kitchens`}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#f97316',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'inline-block',
                    border: '2px solid #f97316',
                    margin: '4px'
                  }}
                >
                  Browse Tiffins
                </a>
              </div>
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
                Thank you for contacting TifinCart! We appreciate your patience and are always here to help you have the best tiffin experience.
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
              <strong>The TifinCart Support Team</strong> 🍱
            </Text>

            <div
              style={{
                backgroundColor: isResolved ? '#ecfdf5' : '#f0f9ff',
                borderLeft: `4px solid ${isResolved ? '#10b981' : '#3b82f6'}`,
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: isResolved ? '#065f46' : '#1d4ed8',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                💡 {isResolved 
                  ? 'We\'re glad we could help! Don\'t forget to explore our amazing tiffin options.' 
                  : 'Need more help? Our support team is always available for new inquiries.'}
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
              {isResolved ? 'Thank you for choosing TifinCart! 🎉' : 'Thank you for your patience! 🙏'}<br />
              The TifinCart Team
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. Supporting local food businesses.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
