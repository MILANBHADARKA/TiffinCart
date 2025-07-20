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

export default function KitchenApprovedEmail({ ownerName, kitchenName, kitchenId }) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Your kitchen has been approved!</title>
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
      <Preview>Your kitchen "{kitchenName}" has been approved and is now live!</Preview>
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
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
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
                Congratulations {ownerName || 'Seller'}!
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
                Your kitchen "<strong>{kitchenName}</strong>" has been approved and is now visible to customers on TifinCart.
              </Text>
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
                You can now manage your kitchen, add products, and start serving your customers.
              </Text>
            </Row>

            <Text
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '24px 0 8px',
                textAlign: 'center',
              }}
            >
              Thank you for being a part of TifinCart!
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                textAlign: 'center',
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
