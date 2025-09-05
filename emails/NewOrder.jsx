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

export default function NewOrderEmail({ 
  sellerName, 
  customerName, 
  orderId, 
  kitchenName, 
  items, 
  totalAmount, 
  deliveryAddress, 
  deliveryDate,
  deliveryTimeWindow,
  mealCategory,
  paymentMethod 
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>New Order Received - TifinCart</title>
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
      <Preview>New {mealCategory} order #{orderId?.slice(-8)} from {customerName} for ₹{totalAmount}</Preview>
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
                width: '60px',
                height: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              🍱
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
                🎉 New Order Received!
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
                Hello {sellerName || 'Seller'}, you have a new tiffin order for your kitchen "{kitchenName}".
              </Text>
            </Row>

            {/* Order Summary Box */}
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
                📋 Order Details
              </Heading>
              
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0', fontWeight: '600' }}>
                  <strong>Order ID:</strong> #{orderId?.slice(-8)}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Customer:</strong> {customerName}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Meal Category:</strong> {mealCategory} 🍽️
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Delivery Date:</strong> {new Date(deliveryDate).toLocaleDateString()}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Delivery Window:</strong> {deliveryTimeWindow}
                </Text>
                <Text style={{ color: '#92400e', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Payment Method:</strong> {paymentMethod === 'cash' ? 'Cash on Delivery 💵' : 'Online Payment 💳'}
                </Text>
              </div>
            </div>

            {/* Items List */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h4"
                style={{
                  color: '#1f2937',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  margin: '0 0 12px 0',
                }}
              >
                🛒 Order Items ({items?.length || 0})
              </Heading>
              
              {items && items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <div>
                    <Text style={{ color: '#374151', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                      {item.name} {item.isVeg ? '🌿' : '🍖'}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>
                      ₹{item.price} × {item.quantity}
                    </Text>
                  </div>
                  <Text style={{ color: '#374151', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
              ))}
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0 0 0',
                  marginTop: '12px',
                  borderTop: '2px solid #374151',
                }}
              >
                <Text style={{ color: '#374151', fontSize: '16px', margin: '0', fontWeight: 'bold' }}>
                  Total Amount:
                </Text>
                <Text style={{ color: '#f97316', fontSize: '18px', margin: '0', fontWeight: 'bold' }}>
                  ₹{totalAmount}
                </Text>
              </div>
            </div>

            {/* Delivery Address */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h4"
                style={{
                  color: '#065f46',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  margin: '0 0 8px 0',
                }}
              >
                📍 Delivery Address
              </Heading>
              <Text style={{ color: '#065f46', fontSize: '14px', margin: '0' }}>
                {deliveryAddress}
              </Text>
            </div>

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
                ⚡ Action Required
              </Text>
              <Text
                style={{
                  color: '#991b1b',
                  fontSize: '14px',
                  margin: '0',
                }}
              >
                Please log into your TifinCart seller dashboard to confirm this order and start preparation.
              </Text>
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
                <strong>Next Steps:</strong>
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                1. 📲 Log into your seller dashboard
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                2. ✅ Confirm the order to start preparation
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                3. 👨‍🍳 Prepare fresh tiffin with love
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                4. 🚚 Update order status for delivery coordination
              </Text>
            </Row>

            <div
              style={{
                backgroundColor: '#ddd6fe',
                borderLeft: '4px solid #8b5cf6',
                padding: '16px',
                borderRadius: '6px',
                marginTop: '24px',
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
                💡 Remember: Fresh tiffins taste best when prepared with care and delivered on time. Your customer is counting on you!
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
              Happy Cooking! 👨‍🍳<br />
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
