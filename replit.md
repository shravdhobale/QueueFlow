# QueueFlow - Digital Queue Management System

## Overview

QueueFlow is a comprehensive web-based queue management system designed for service-based businesses like salons, clinics, restaurants, and auto shops. The application enables customers to join queues digitally without downloading apps, while providing businesses with real-time queue management capabilities and automated SMS notifications.

The system features a customer-facing interface for joining queues and tracking positions, plus a business dashboard for queue management, analytics, and customer service. Real-time updates are provided through WebSocket connections, and SMS notifications keep customers informed of their queue status.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom design system variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation for type-safe forms
- **Real-time Updates**: Custom WebSocket hook for live queue status updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: In-memory storage implementation with plans for PostgreSQL migration using Drizzle ORM
- **Real-time Communication**: WebSocket Server (ws) for broadcasting queue updates to connected clients
- **Authentication**: JWT tokens for business dashboard access with bcrypt for password hashing
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Data Storage Solutions
- **Current**: In-memory storage using Maps for development and prototyping
- **Planned**: PostgreSQL database with Drizzle ORM for production deployment
- **Schema**: Well-defined database schema with businesses, queues, and users tables
- **Migration Support**: Drizzle Kit configured for database migrations and schema management

### Authentication and Authorization
- **Business Authentication**: JWT-based authentication system for business dashboard access
- **Session Management**: Token storage in localStorage with automatic expiration handling
- **Password Security**: bcrypt hashing for secure password storage
- **Route Protection**: Middleware-based authentication checks for protected business endpoints

## External Dependencies

### Third-party Services
- **SMS Notifications**: Twilio integration for sending queue status updates and notifications to customers
- **Database**: Neon Database (PostgreSQL) configured for production deployment
- **Development Tools**: Replit-specific plugins for development environment integration

### Key Libraries
- **UI Components**: Comprehensive Radix UI component collection for accessible interface elements
- **Form Management**: React Hook Form with Zod for robust form validation and type safety
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Real-time**: WebSocket implementation for live updates without polling
- **Date Handling**: date-fns for consistent date/time operations
- **Build Tools**: Vite for fast development server and optimized production builds
- **Type Safety**: TypeScript throughout the application with strict configuration