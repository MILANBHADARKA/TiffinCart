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

export default function NewKitchenApprovalEmail({ adminEmail, kitchenId, kitchenName, kitchenDescription }) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>TifinCart - New Kitchen Approval Needed</title>
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
      <Preview>New kitchen "{kitchenName}" is awaiting your approval</Preview>
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
                width: '60px',
                height: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '4px',
                }}
              ></div>
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              TifinCart
            </Heading>
          </div>

          {/* Content */}
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
                Hello {adminEmail || 'Admin'},
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
                A new kitchen has been created by a seller and is awaiting your approval.
              </Text>
            </Row>
            <Row>
              <Heading
                as="h3"
                style={{
                  color: '#22c55e',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {kitchenName}
              </Heading>
            </Row>
            <Row>
              <Text
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                {kitchenDescription}
              </Text>
            </Row>
            <Row>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#16a34a',
                  backgroundColor: '#f1f5f9',
                  padding: '12px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  border: '1px dashed #16a34a',
                  marginBottom: '24px',
                }}
              >
                Kitchen ID: {kitchenId}
              </div>
            </Row>
            <Row>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                }}
              >
                Please review this kitchen and take action to approve or reject it in the admin panel.
              </Text>
            </Row>

            {/* Security Notice */}
            <div
              style={{
                backgroundColor: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: '#92400e',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                ⚠️ Please ensure the details are accurate before approving.
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
              Best regards,<br />
              The TifinCart Team
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. All rights reserved.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
