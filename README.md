<div align="center">
  
  # 🍱 TifinCart
  
  **Connecting food lovers with authentic homemade meals from local sellers**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0+-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
  
  [🔗 Live Demo](https://tifincart.vercel.app) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/yourusername/tifincart/issues) • [✨ Request Feature](https://github.com/yourusername/tifincart/issues)

</div>

---

## 🌟 Overview

TifinCart is a modern, full-stack food delivery platform that bridges the gap between home chefs and food enthusiasts. Built with cutting-edge technologies, it provides a seamless experience for ordering authentic homemade meals while empowering local sellers to grow their culinary businesses.

### ✨ Key Highlights

- 🏠 **Authentic Homemade Food** - Fresh, traditional recipes from local home chefs
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark/Light Mode** - User-friendly theme switching
- 🔐 **Secure Authentication** - JWT-based auth with email verification
- 📊 **Real-time Analytics** - Comprehensive dashboard for sellers
- ⭐ **Review System** - Detailed feedback for items and kitchens
- 🚚 **Smart Delivery** - Optimized delivery scheduling and tracking

---

## 🚀 Features

### For Customers 👥
- **Browse Local Kitchens** - Discover homemade food in your area
- **Smart Filtering** - Filter by cuisine, dietary preferences, and ratings
- **Real-time Ordering** - Live order tracking with delivery windows
- **Meal Planning** - Schedule breakfast, lunch, and dinner orders
- **Review & Rating** - Rate individual items and overall kitchen experience
- **Favorites & History** - Save favorite dishes and view order history
- **Secure Payments** - Multiple payment options with order protection

### For Sellers 👨‍🍳
- **Kitchen Management** - Complete profile and menu management
- **Order Processing** - Real-time order notifications and status updates
- **Analytics Dashboard** - Revenue tracking, popular items, and customer insights
- **Delivery Settings** - Flexible delivery charges and service areas
- **Inventory Control** - Manage item availability and stock
- **Customer Communication** - Direct messaging and order notes
- **Performance Metrics** - Detailed reports on sales and customer satisfaction

### Platform Features 🔧
- **Email Notifications** - Automated order confirmations and updates
- **Image Upload** - Cloudinary integration for food photography
- **Responsive UI** - Tailwind CSS with dark/light mode support
- **SEO Optimized** - Next.js with proper meta tags and sitemap
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Security** - Input validation, rate limiting, and data protection

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[MongoDB](https://mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[JWT](https://jwt.io/)** - JSON Web Tokens for authentication

### Services & Tools
- **[Cloudinary](https://cloudinary.com/)** - Image upload and optimization
- **[Resend](https://resend.com/)** - Email delivery service
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

---

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- MongoDB database
- Cloudinary account
- Email service (Resend/SendGrid)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tifincart.git
   cd tifincart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/tifincart
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Service
   RESEND_API_KEY=your-resend-api-key
   
   # App URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

