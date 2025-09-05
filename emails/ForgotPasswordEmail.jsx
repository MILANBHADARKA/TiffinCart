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

export default function ForgotPasswordEmail({ name, verifyCode }) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>TifinCart - Password Reset</title>
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
      <Preview>Your TifinCart password reset code: {verifyCode}</Preview>
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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
              🔒
            </div>
            <Heading
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              Password Reset Request
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              Secure access to your TifinCart account
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
                Hi {name || 'there'}! 👋
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
                We received a request to reset your TifinCart account password. Use the verification code below to proceed with resetting your password.
              </Text>
            </Row>

            <Row>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#ef4444',
                  backgroundColor: '#f1f5f9',
                  padding: '24px',
                  borderRadius: '12px',
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                  border: '2px dashed #ef4444',
                  margin: '24px 0',
                }}
              >
                {verifyCode}
              </div>
            </Row>

            <Row>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                This verification code will expire in <strong>10 minutes</strong> for security reasons.
              </Text>
            </Row>

            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <Text
                style={{
                  color: '#991b1b',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                ⚠️ <strong>Important Security Notice:</strong> If you didn't request this password reset, please ignore this email and consider changing your password immediately.
              </Text>
            </div>

            <Row>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                }}
              >
                After entering this code, you'll be able to create a new password for your account. Make sure to choose a strong password to keep your account secure.
              </Text>
            </Row>

            <div
              style={{
                backgroundColor: '#ddd6fe',
                border: '1px solid #8b5cf6',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <Text
                style={{
                  color: '#5b21b6',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                💡 <strong>Password Tips:</strong> Use a combination of uppercase and lowercase letters, numbers, and special characters for maximum security.
              </Text>
            </div>

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
                🔒 Security Tip: Never share this code with anyone. TifinCart staff will never ask for your verification codes or passwords.
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
              Stay secure! 🔐<br />
              The TifinCart Team
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. Protecting your account security.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
