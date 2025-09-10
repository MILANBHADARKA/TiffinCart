# 🍱 TifinCart - Homemade Food Delivery Platform

> **Connecting food lovers with authentic homemade meals from local kitchen owners**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.0-green?style=for-the-badge&logo=mongoose)](https://mongoosejs.com/docs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-4.1-blue?style=for-the-badge&logo=jwt)](https://www.npmjs.com/package/jsonwebtoken)
[![Razorpay](https://img.shields.io/badge/razorpay-2.9-blue?style=for-the-badge&logo=razorpay)](https://www.npmjs.com/package/jsonwebtoken)


## 🌟 Overview

TifinCart is a comprehensivedaily tiffin ordering platform that bridges the gap between home chefs and food enthusiasts. The platform enables local kitchen owners to showcase their homemade meals while providing customers with access to authentic, fresh, and affordable tiffin services.

### 🎯 Key Objectives
- **Empower Home Chefs**: Provide a platform for home cooks to monetize their culinary skills
- **Fresh & Authentic**: Ensure customers get home-style, freshly prepared meals
- **Community Building**: Foster local food communities and cultural exchange
- **Sustainable Business**: Support local economies and reduce food waste

## ✨ Features

### 👥 For Customers
- **🔍 Smart Discovery**: Browse and search local kitchens by cuisine, location
- **🛒 Shopping Cart**: Add items from kitchens with cart management
- **📦 Order Tracking**: Real-time order status updates from preparation to delivery
- **⭐ Reviews & Ratings**: Rate kitchens
- **🔔 Email Notifications**: Order confirmations, delivery updates, and promotional content

### 👨‍🍳 For Kitchen Owners (Sellers)
- **🏪 Kitchen Management**: Create and manage multiple kitchen profiles
- **📋 Menu Builder**: Add unlimited menu items with rich descriptions and images
- **📊 Order Management**: Track incoming orders with status updates
- **💰 Subscription Plans**: Flexible plans to unlock advanced features
- **📈 Analytics Dashboard**: View earnings, order statistics, and performance metrics
- **🚚 Delivery Settings**: Configure delivery radius, charges, and minimum orders

### 👑 For Admins
- **🏢 Kitchen Approval**: Review and approve new kitchen applications
- **💳 Subscription Control**: Create and manage subscription plans and pricing
- **📊 System Analytics**: Comprehensive platform statistics and insights
- **💰 Payment Oversight**: Track subscription payments and transaction history

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js
- **UI Library**: React 18 with hooks and context
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Image Handling**: Cloudinary integration
- **Responsive Design**: Mobile-first approach

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **File Upload**: Cloudinary for image storage
- **Email Service**: Resend with React Email templates

### Payment & Subscriptions
- **Payment Gateway**: Razorpay integration
- **Subscription Management**: Custom subscription system
- **Webhook Handling**: Automated payment verification

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Environment**: Node.js with dotenv


### Subscription Features
- **Limit Enforcement**: Real-time validation of subscription limits
- **Usage Analytics**: Detailed breakdown of feature usage

## 📧 Email Templates

The system includes professional email templates for:

### Transactional Emails
- **Email Verification**: Account activation with OTP
- **Password Reset**: Secure password reset with OTP
- **Order Confirmations**: Detailed order summaries for customers
- **Order Updates**: Status delivered notifications

### Business Emails
- **New Order Notifications**: Instant alerts to sellers
- **Kitchen Approval**: Status updates for kitchen applications

### Template Features
- **Responsive Design**: Mobile-optimized layouts
- **Brand Consistency**: TifinCart branding and colors
- **Rich Content**: Order details, images, and tracking information
- **Call-to-Actions**: Clear next steps and buttons


## 🚀 Deployment

### Production Deployment

#### Using Vercel (Recommended)
1. **Connect Repository**
   ```bash
   # Push to GitHub and connect to Vercel
   git push origin main
   ```

2. **Environment Variables**
   - Add all production environment variables in Vercel dashboard
   - Ensure database URLs point to production MongoDB

3. **Custom Domain**
   - Configure custom domain in Vercel settings
   - Update NEXT_PUBLIC_BASE_URL accordingly

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines
- **Code Style**: Follow the existing code style and use Prettier
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for any new features
- **Commit Messages**: Use clear and descriptive commit messages


<div align="center">
  <p>Made with ❤️ by the TifinCart Team</p>
  <p>
    <a href="https://tiffincart.vercel.app/">Website</a> • 
    <a href="https://github.com/milanbhadarka/tiffincart/issues">Report Bug</a> •
    <a href="https://github.com/milanbhadarka/tiffincart/issues">Request Feature</a>
  </p>
</div>