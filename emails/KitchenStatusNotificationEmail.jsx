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

export default function KitchenStatusNotificationEmail({ 
  ownerName, 
  kitchenName, 
  status, 
  remarks,
  dashboardUrl = 'https://tifincart.com/seller/kitchens'
}) {
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isSuspended = status === 'suspended';
  
  const statusText = isApproved ? 'approved' : 
                    isRejected ? 'not approved' : 
                    isSuspended ? 'suspended' : 'updated';
  
  const statusColor = isApproved ? '#22c55e' : 
                     isRejected ? '#ef4444' : 
                     isSuspended ? '#f59e0b' : '#6b7280';
  
  const statusIcon = isApproved ? '✅' : 
                    isRejected ? '❌' : 
                    isSuspended ? '⚠️' : '📋';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Kitchen Status Update - TifinCart</title>
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
      <Preview>Your kitchen "{kitchenName}" has been {statusText}</Preview>
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
          <div
            style={{
              background: isApproved 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : isRejected 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
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
              Kitchen {statusText.charAt(0).toUpperCase() + statusText.slice(1)}!
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              Status update for your kitchen
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
                Hello {ownerName}! 👋
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
                We have an important update regarding your kitchen "{kitchenName}" on TifinCart.
              </Text>
            </Row>

            {/* Status Update */}
            <div
              style={{
                backgroundColor: isApproved ? '#ecfdf5' : isRejected ? '#fef2f2' : '#fef3c7',
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
                {statusIcon} Kitchen Status: {statusText.toUpperCase()}
              </Heading>
              
              <Text style={{ 
                color: statusColor, 
                fontSize: '16px', 
                margin: '0',
                fontWeight: '500'
              }}>
                Your kitchen "{kitchenName}" has been {statusText} by our admin team.
              </Text>
            </div>

            {/* Admin Remarks */}
            {remarks && (
              <div
                style={{
                  backgroundColor: '#f1f5f9',
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
                  💬 Admin Remarks
                </Heading>
                
                <Text style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  margin: '0',
                  fontStyle: 'italic',
                  lineHeight: '1.6'
                }}>
                  "{remarks}"
                </Text>
              </div>
            )}

            {/* Next Steps */}
            {isApproved && (
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
                  🎉 Congratulations! What's Next?
                </Heading>
                
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • 📋 Set up your menu items and pricing
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • 🏪 Update your kitchen status to "Open" to start receiving orders
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '6px 0' }}>
                  • 📦 Prepare for your first tiffin orders!
                </Text>
              </div>
            )}

            {isRejected && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  as="h4"
                  style={{
                    color: '#991b1b',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  📝 What You Can Do Next
                </Heading>
                
                <Text style={{ color: '#991b1b', fontSize: '14px', margin: '6px 0' }}>
                  • 📧 Contact our support team for clarification
                </Text>
                <Text style={{ color: '#991b1b', fontSize: '14px', margin: '6px 0' }}>
                  • 📋 Review and update your kitchen information
                </Text>
                <Text style={{ color: '#991b1b', fontSize: '14px', margin: '6px 0' }}>
                  • 🔄 Submit a revised application with corrected details
                </Text>
                <Text style={{ color: '#991b1b', fontSize: '14px', margin: '6px 0' }}>
                  • 📞 Reach out if you have any questions
                </Text>
              </div>
            )}

            {isSuspended && (
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  as="h4"
                  style={{
                    color: '#92400e',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  ⚠️ Kitchen Suspended
                </Heading>
                
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  Your kitchen has been temporarily suspended. Please review the admin remarks above and contact support for assistance.
                </Text>
              </div>
            )}

            {/* Dashboard Button */}
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <a
                href={dashboardUrl}
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
                {isApproved ? 'Go to My Kitchen Dashboard' : 'View My Kitchens'}
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
                If you have any questions about this decision or need assistance, please don't hesitate to contact our support team. We're here to help you succeed!
              </Text>
            </Row>

            <div
              style={{
                backgroundColor: '#f1f5f9',
                borderLeft: '4px solid #3b82f6',
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: '#1d4ed8',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                💡 {isApproved 
                  ? 'Pro tip: High-quality photos and detailed descriptions help attract more customers!' 
                  : 'Need help? Our support team is available to guide you through the process.'}
              </Text>
            </div>
          </div>

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
              {isApproved ? 'Welcome to the TifinCart family! 🎉' : 'Thank you for your patience! 🙏'}<br />
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
