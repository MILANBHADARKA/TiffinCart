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

export default function ContactNotificationEmail({ 
  name, 
  email, 
  subject,
  category,
  message,
  createdAt = new Date(),
  dashboardUrl = 'https://tifincart.com/admin/contact'
}) {
  const categoryLabels = {
    general: 'General Inquiry',
    order: 'Order Support',
    payment: 'Payment Help',
    seller: 'Become a Seller',
    technical: 'Technical Support',
    feedback: 'Feedback & Suggestions'
  };

  const categoryColors = {
    general: '#6b7280',
    order: '#dc2626',
    payment: '#f59e0b',
    seller: '#10b981',
    technical: '#3b82f6',
    feedback: '#8b5cf6'
  };

  const categoryIcons = {
    general: '💬',
    order: '📦',
    payment: '💳',
    seller: '🏪',
    technical: '🔧',
    feedback: '⭐'
  };

  const priorityLevel = category === 'order' || category === 'payment' ? 'HIGH' : 
                      category === 'technical' ? 'MEDIUM' : 'LOW';
  
  const priorityColor = priorityLevel === 'HIGH' ? '#dc2626' : 
                       priorityLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>New Contact Message - TifinCart</title>
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
      <Preview>New {categoryLabels[category]} message from {name}</Preview>
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
              background: 'linear-gradient(135deg, #f97316, #dc2626)',
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
              📧
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              New Contact Message!
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              You have received a new message from TifinCart
            </Text>
          </div>

          <div style={{ padding: '40px 20px' }}>
            {/* Priority Badge */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span
                style={{
                  backgroundColor: priorityColor,
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {priorityLevel} Priority
              </span>
            </div>

            {/* Message Details */}
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
                as="h2"
                style={{
                  color: '#1f2937',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}
              >
                📋 Message Details
              </Heading>
              
              {/* Customer Info Grid */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    margin: '0',
                    minWidth: '100px'
                  }}>
                    From:
                  </Text>
                  <Text style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    margin: '0'
                  }}>
                    {name} ({email})
                  </Text>
                </div>

                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    margin: '0',
                    minWidth: '100px'
                  }}>
                    Category:
                  </Text>
                  <Text style={{ 
                    color: categoryColors[category], 
                    fontSize: '14px', 
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    {categoryIcons[category]} {categoryLabels[category]}
                  </Text>
                </div>

                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    margin: '0',
                    minWidth: '100px'
                  }}>
                    Subject:
                  </Text>
                  <Text style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    margin: '0'
                  }}>
                    {subject}
                  </Text>
                </div>

                <div style={{ display: 'flex' }}>
                  <Text style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    margin: '0',
                    minWidth: '100px'
                  }}>
                    Received:
                  </Text>
                  <Text style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    margin: '0'
                  }}>
                    {new Date(createdAt).toLocaleString('en-IN', { 
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </Text>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #f97316',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: '#f97316',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                💬 Customer Message
              </Heading>
              
              <Text style={{ 
                color: '#374151', 
                fontSize: '16px', 
                margin: '0',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {message}
              </Text>
            </div>

            {/* Quick Actions */}
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
                🚀 Quick Actions
              </Heading>
              
              <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                • Reply directly to this email to respond to the customer
              </Text>
              <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                • Route to {category === 'order' ? 'Order Support Team' : 
                           category === 'payment' ? 'Payment Team' :
                           category === 'technical' ? 'Technical Team' :
                           category === 'seller' ? 'Seller Onboarding Team' :
                           'Customer Service Team'}
              </Text>
              <Text style={{ color: '#4b5563', fontSize: '14px', margin: '6px 0' }}>
                • Customer email: {email}
              </Text>
            </div>

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
                View All Messages
              </a>
            </div>

            <div
              style={{
                backgroundColor: category === 'order' || category === 'payment' ? '#fef2f2' : '#f0f9ff',
                borderLeft: `4px solid ${priorityColor}`,
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: priorityColor,
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                💡 {priorityLevel === 'HIGH' 
                  ? 'High Priority: Please respond within 2 hours during business hours.' 
                  : priorityLevel === 'MEDIUM'
                    ? 'Medium Priority: Please respond within 24 hours.'
                    : 'Standard Priority: Please respond within 48 hours.'}
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
              This is an automated notification from TifinCart Contact System<br />
              Reply-To: {email}
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
