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

export default function OrderDeliveredEmail({ 
  customerName, 
  orderId, 
  kitchenName, 
  items, 
  totalAmount, 
  deliveryDate,
  mealCategory,
  sellerName 
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Order Delivered Successfully - TifinCart</title>
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
      <Preview>Your {mealCategory} order #{orderId?.slice(-8)} has been delivered! Enjoy your meal 🍱</Preview>
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
              Order Delivered!
            </Heading>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                margin: '8px 0 0 0',
              }}
            >
              Your delicious tiffin has arrived 🍱
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
                Hi {customerName || 'Valued Customer'}! 👋
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
                Great news! Your fresh homemade tiffin from <strong>{kitchenName}</strong> has been successfully delivered. 
                We hope you enjoy every bite of your {mealCategory.toLowerCase()} meal! 🥘
              </Text>
            </Row>

            {/* Order Summary Box */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: '#065f46',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                }}
              >
                📋 Order Summary
              </Heading>
              
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0', fontWeight: '600' }}>
                  <strong>Order ID:</strong> #{orderId?.slice(-8)}
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Kitchen:</strong> {kitchenName}
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Prepared by:</strong> {sellerName} 👨‍🍳
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Meal Type:</strong> {mealCategory} 🍽️
                </Text>
                <Text style={{ color: '#065f46', fontSize: '14px', margin: '4px 0' }}>
                  <strong>Delivered on:</strong> {new Date(deliveryDate).toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </Text>
              </div>
            </div>

            {/* Items List */}
            <div
              style={{
                backgroundColor: '#fef3c7',
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
                🍱 Your Tiffin Contains ({items?.length || 0} items)
              </Heading>
              
              {items && items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < items.length - 1 ? '1px solid #fbbf24' : 'none',
                  }}
                >
                  <div>
                    <Text style={{ color: '#92400e', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                      {item.name} {item.isVeg ? '🌿' : '🍖'}
                    </Text>
                    <Text style={{ color: '#a16207', fontSize: '12px', margin: '0' }}>
                      Quantity: {item.quantity}
                    </Text>
                  </div>
                  <Text style={{ color: '#92400e', fontSize: '14px', margin: '0', fontWeight: '600' }}>
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
                  borderTop: '2px solid #92400e',
                }}
              >
                <Text style={{ color: '#92400e', fontSize: '16px', margin: '0', fontWeight: 'bold' }}>
                  Total Amount Paid:
                </Text>
                <Text style={{ color: '#16a34a', fontSize: '18px', margin: '0', fontWeight: 'bold' }}>
                  ₹{totalAmount}
                </Text>
              </div>
            </div>

            {/* Enjoyment Message */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #fb7185',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <Text
                style={{
                  color: '#be185d',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                🥳 Enjoy Your Meal!
              </Text>
              <Text
                style={{
                  color: '#be185d',
                  fontSize: '14px',
                  margin: '0',
                }}
              >
                Your tiffin was prepared with love and fresh ingredients. 
                We hope it brings you the comfort and taste of home! ❤️
              </Text>
            </div>

            {/* Rating Request */}
            <div
              style={{
                backgroundColor: '#ddd6fe',
                border: '1px solid #8b5cf6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <Text
                style={{
                  color: '#5b21b6',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                ⭐ Rate Your Experience
              </Text>
              <Text
                style={{
                  color: '#6d28d9',
                  fontSize: '14px',
                  margin: '0 0 12px 0',
                }}
              >
                How was your tiffin? Your feedback helps our sellers improve and helps other customers discover great food!
              </Text>
              <Text
                style={{
                  color: '#5b21b6',
                  fontSize: '12px',
                  margin: '0',
                  fontStyle: 'italic',
                }}
              >
                💡 You can rate and review your order in the TifinCart web under "My Orders"
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
                <strong>What's Next?</strong>
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                🍽️ Enjoy your delicious homemade tiffin
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                }}
              >
                ⭐ Rate your experience to help others
              </Text>
              <Text
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                🍱 Explore more amazing kitchens on TifinCart
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
                🙏 Thank you for choosing TifinCart! Your support helps local home chefs share their passion for cooking with the community.
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
              Bon Appétit! 🍽️<br />
              The TifinCart Team
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: '0',
              }}
            >
              © 2025 TifinCart. Connecting you with homemade goodness.
            </Text>
          </div>
        </div>
      </Section>
    </Html>
  );
}
