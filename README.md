
# QueueFlow - Digital Queue Management System

A modern, web-based queue management platform that revolutionizes how businesses handle customer queues and how customers experience waiting.

## 🌟 Overview

QueueFlow eliminates the frustration of waiting in physical lines by enabling customers to join queues digitally and receive real-time updates. Built for service-based businesses like salons, clinics, restaurants, and auto shops, it provides a seamless experience without requiring customers to download any apps.

## ✨ Key Features

### For Customers
- **App-free Experience**: Join queues using any web browser
- **Real-time Updates**: Live queue position and wait time updates
- **SMS Notifications**: Get notified when your turn approaches
- **Multi-business Support**: Manage queues across different businesses
- **Queue Status Tracking**: Track your position and estimated wait time

### For Businesses
- **Digital Queue Management**: Manage customer queues from any device
- **Real-time Dashboard**: Live view of pending and active queues
- **Customer Approval System**: Review and approve queue requests
- **SMS Integration**: Automated customer notifications via Twilio
- **Analytics & Insights**: Track performance metrics and optimize operations
- **Service Time Management**: Configure and adjust service durations

### For Administrators
- **Business Management**: Create and manage business listings
- **Category Organization**: Organize businesses by service categories
- **System Analytics**: Monitor platform-wide performance
- **User Management**: Handle business and customer accounts

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Shadcn/ui** component library built on Radix UI primitives
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation for robust forms

### Backend
- **Node.js** with Express.js framework
- **WebSocket Server** for real-time updates
- **JWT Authentication** with bcrypt password hashing
- **In-memory Storage** (development) with Drizzle ORM ready for PostgreSQL
- **Twilio Integration** for SMS notifications

### Database
- **Current**: In-memory storage for development
- **Planned**: PostgreSQL with Drizzle ORM for production

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/queueflow.git
   cd queueflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for SMS)
   ```bash
   # Create .env file
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
queueflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes and WebSocket setup
│   └── storage.ts         # Data storage layer
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── README.md
```

## 🎯 Usage Examples

### For Customers
1. Visit the QueueFlow homepage
2. Browse businesses by category or search
3. Select a business and join their queue
4. Provide your contact information and service details
5. Receive SMS updates and track your position in real-time

### For Businesses
1. Register for a business account
2. Set up your business profile and services
3. Monitor incoming queue requests in the dashboard
4. Approve customers and manage your queue
5. Start service for customers when they arrive

### For Administrators
1. Log in to the admin dashboard
2. Create and manage business listings
3. Monitor platform analytics
4. Manage categories and system settings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Business user login
- `POST /api/auth/register` - Business user registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/customer/register` - Customer registration
- `POST /api/auth/admin/login` - Admin login

### Queue Management
- `GET /api/queue/:businessId` - Get business queue
- `POST /api/queue/join` - Join a queue
- `GET /api/queue/status/:id` - Get queue item status
- `PUT /api/queue/:id/approve` - Approve queue request
- `PUT /api/queue/:id/start-service` - Start customer service
- `PUT /api/queue/:id/serve` - Mark customer as served
- `DELETE /api/queue/:id` - Remove customer from queue

### Business Management
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/:id` - Get specific business
- `POST /api/businesses` - Create new business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

## 🔄 Real-time Features

QueueFlow uses WebSocket connections to provide real-time updates:
- Live queue position changes
- Instant notifications when customers join or leave
- Real-time wait time calculations
- Business dashboard live updates

## 📱 SMS Integration

Integration with Twilio provides:
- Queue join confirmation messages
- Position update notifications
- "Your turn is coming" alerts
- Service ready notifications

## 🔐 Security Features

- JWT-based authentication
- bcrypt password hashing
- Input validation with Zod schemas
- Protected API routes
- Secure WebSocket connections


