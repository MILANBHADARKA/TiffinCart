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

export default function KitchenApprovalRequestEmail({ 
  kitchenData, 
  ownerDetails,
  adminDashboardUrl = 'https://tifincart.com/admin/kitchens'
}) {
  const kitchenAddress = kitchenData.address ? 
    `${kitchenData.address.street}, ${kitchenData.address.city}, ${kitchenData.address.state} - ${kitchenData.address.zipCode}` :
    'Address not provided';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>New Kitchen Approval Request - TifinCart</title>
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
      <Preview>New kitchen "{kitchenData.name}" submitted for approval by {ownerDetails.name}</Preview>
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
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'white',
                borderRadius: '12px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}
            >
              🏪
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              Kitchen Approval Request
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              New kitchen submission requires review
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
                🆕 New Kitchen Submission
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
                A new kitchen has been submitted for approval by {ownerDetails.name}. Please review the details below and take appropriate action.
              </Text>
            </Row>

            {/* Kitchen Details */}
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
                🏪 Kitchen Information
              </Heading>
              
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0', fontWeight: '600' }}>
                  <strong>Kitchen Name:</strong> {kitchenData.name}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  <strong>Cuisine Type:</strong> {kitchenData.cuisine}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  <strong>Description:</strong> {kitchenData.description}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  <strong>Address:</strong> {kitchenAddress}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  <strong>Contact Phone:</strong> {kitchenData.contact?.phone || 'Not provided'}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '6px 0' }}>
                  <strong>Contact Email:</strong> {kitchenData.contact?.email || 'Not provided'}
                </Text>
              </div>
            </div>

            {/* License Information */}
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
                📋 License & Legal Details
              </Heading>
              
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                <strong>FSSAI Number:</strong> {kitchenData.license?.fssaiNumber || 'Not provided'}
              </Text>
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                <strong>GST Number:</strong> {kitchenData.license?.gstNumber || 'Not provided'}
              </Text>
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                <strong>Business License:</strong> {kitchenData.license?.businessLicense || 'Not provided'}
              </Text>
            </div>

            {/* Owner Information */}
            <div
              style={{
                backgroundColor: '#ddd6fe',
                border: '1px solid #8b5cf6',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h4"
                style={{
                  color: '#5b21b6',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                👤 Owner Details
              </Heading>
              
              <Text style={{ color: '#6d28d9', fontSize: '14px', margin: '4px 0' }}>
                <strong>Name:</strong> {ownerDetails.name}
              </Text>
              <Text style={{ color: '#6d28d9', fontSize: '14px', margin: '4px 0' }}>
                <strong>Email:</strong> {ownerDetails.email}
              </Text>
              <Text style={{ color: '#6d28d9', fontSize: '14px', margin: '4px 0' }}>
                <strong>Submission Date:</strong> {new Date().toLocaleDateString()}
              </Text>
            </div>

            {/* Delivery Information */}
            {kitchenData.deliveryInfo && (
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  as="h4"
                  style={{
                    color: '#1e40af',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}
                >
                  🚚 Delivery Information
                </Heading>
                
                <Text style={{ color: '#1e40af', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Delivery Charge:</strong> ₹{kitchenData.deliveryInfo.deliveryCharge || 0}
                </Text>
                <Text style={{ color: '#1e40af', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Minimum Order:</strong> ₹{kitchenData.deliveryInfo.minimumOrder || 0}
                </Text>
                <Text style={{ color: '#1e40af', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Free Delivery Above:</strong> ₹{kitchenData.deliveryInfo.freeDeliveryAbove || 'Not set'}
                </Text>
                <Text style={{ color: '#1e40af', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Max Delivery Distance:</strong> {kitchenData.deliveryInfo.maxDeliveryDistance || 'Not set'} km
                </Text>
              </div>
            )}

            {/* Action Required */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <Text
                style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                ⚡ Admin Action Required
              </Text>
              <Text
                style={{
                  color: '#991b1b',
                  fontSize: '14px',
                  margin: '0 0 16px 0',
                }}
              >
                Please review this kitchen submission and approve or reject it based on the provided information.
              </Text>
              
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <a
                  href={adminDashboardUrl}
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
                  Review Kitchen Submission
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
                <strong>Review Checklist:</strong>
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                ✅ Verify FSSAI license number
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                ✅ Check address and contact information
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                ✅ Review kitchen description and cuisine type
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                ✅ Validate delivery information and pricing
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
                💡 Quick actions available in admin dashboard: Approve, Reject, Request more information, or suspend kitchen.
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
              Admin Notification 👑<br />
              The TifinCart Team
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. Supporting quality food businesses.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
