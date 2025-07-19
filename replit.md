# Wingy Shop - E-commerce Marketplace

## Overview

Wingy Shop is a full-stack e-commerce marketplace application built with React, Express.js, and PostgreSQL. The application allows users to buy and sell products with a dual-confirmation transaction system. It features user authentication, product management, and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and bundling
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Session Management**: Express sessions with PostgreSQL store

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle-kit for schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL

## Key Components

### Authentication System
- JWT-based authentication with refresh tokens
- Password hashing using bcryptjs
- Role-based access control (admin/user permissions)
- Middleware for route protection

### Product Management
- CRUD operations for products
- Image upload support
- Product categorization with tags
- Stock management
- Admin approval system for product listings

### Transaction System
- Dual-confirmation system (both buyer and seller must confirm)
- Escrow-like balance management
- Transaction status tracking
- Order history and management

### User Interface
- Responsive design with mobile-first approach
- Dark/light theme support
- Component library based on Radix UI primitives
- Form validation with real-time feedback
- Toast notifications for user feedback

## Data Flow

### User Registration/Login
1. User submits credentials
2. Backend validates and hashes password
3. JWT token generated and returned
4. Frontend stores token for authenticated requests

### Product Listing
1. Seller creates product listing
2. Admin reviews and approves/rejects
3. Approved products appear in marketplace
4. Real-time stock updates

### Purchase Flow
1. Buyer initiates purchase
2. Transaction created with "pending" status
3. Buyer confirms purchase (balance deducted)
4. Seller confirms shipment
5. Transaction completed, funds transferred

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token handling
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Mode
- Vite dev server for frontend hot reloading
- tsx for backend TypeScript execution
- Database migrations via drizzle-kit
- Environment variables for configuration

### Production Build
- Frontend: Vite build to static assets
- Backend: esbuild bundle for Node.js
- Database: PostgreSQL with connection pooling
- Static file serving via Express

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment mode (development/production)

### Key Architectural Decisions

1. **Dual-confirmation transactions**: Chosen to build trust between buyers and sellers, ensuring both parties confirm the transaction
2. **PostgreSQL over MongoDB**: Selected for ACID compliance and complex relational queries needed for transactions
3. **Drizzle ORM**: Provides type safety while maintaining performance and flexibility
4. **JWT Authentication**: Stateless authentication suitable for scaling
5. **Shadcn/ui Components**: Provides accessible, customizable components with consistent design
6. **TanStack Query**: Efficient server state management with caching and synchronization

The application is designed to be easily deployable on Replit with minimal configuration while supporting scalable architecture patterns.

## Recent Changes

### July 18, 2025 - Bug Fixes & Wingy Coin API Integration
- ✓ Fixed JSX structure error in `my-orders.tsx` by adding missing closing `</div>` tag
- ✓ Fixed TypeScript type error in `server/storage.ts` by explicitly handling optional product fields (stock, imageUrl, tags)
- ✓ Added missing `@types/jsonwebtoken` dependency to resolve TypeScript declarations
- ✓ Application successfully compiled and is running on port 5000

### July 18, 2025 - Authentication System Integration
- ✓ Created Wingy Coin API service (`server/services/wingycoin-api.ts`) to handle external authentication
- ✓ Updated authentication routes to use `api.wingycoin.com` for login/signup validation
- ✓ Modified query client to include JWT Bearer tokens in authenticated requests
- ✓ Created dedicated login (`/login`) and signup (`/signup`) pages with proper validation
- ✓ Updated navbar to show authentication state and login/signup buttons
- ✓ Implemented dual authentication system (Wingy Coin API + local user storage)
- ✓ Added proper error handling for authentication failures
- ✓ Integrated user data from Wingy Coin API (completedads, wingy balance, etc.)

### July 18, 2025 - Color Scheme & Theme System
- ✓ Implemented custom color scheme using provided light/dark mode colors
- ✓ Created ThemeProvider component for proper theme switching
- ✓ Added theme toggle button in navbar (moon/sun icon)
- ✓ Updated CSS variables to match specified color scheme:
  - Light mode: #ffffff background, #1a1a1a text, #2563eb primary, #6b7280 secondary
  - Dark mode: #111827 background, #ffffff text, #3b82f6 primary, #9ca3af secondary
- ✓ Updated all pages to use semantic color classes (bg-background, text-foreground, etc.)
- ✓ Modified login/signup pages to use theme-aware colors
- ✓ Updated home page components to use new color scheme
- ✓ Integrated theme persistence with localStorage
- ✓ Refined color scheme to blue-based palette for better consistency:
  - Light mode: #f8fafc background, #0f172a text, #3b82f6 primary, #60a5fa accent
  - Dark mode: #0f172a background, #f8fafc text, #60a5fa primary, #1e293b secondary
- ✓ Fixed hero section contrast issues:
  - Made "Wingy Coins" text white and bold for better visibility
  - Updated button styling with better contrast (white bg with blue text)
  - Improved button hover states for better user experience
- ✓ Eliminated all remaining yellow elements from the application (sell page buttons, review box, etc.)

### July 18, 2025 - Get Wingy Page & Balance Integration
- ✓ Created comprehensive "Get Wingy" page with earning opportunities
- ✓ Updated database schema to include wingyCoinUserId, wingyBalance, and completedAds fields
- ✓ Added balance checking functionality using Wingy Coin API
- ✓ Made balance in navbar clickable, redirecting to Get Wingy page
- ✓ Implemented automatic balance checks every 30 seconds
- ✓ Added insufficient balance detection during purchase attempts
- ✓ Integrated redirect to Get Wingy page when balance is insufficient
- ✓ Updated navbar to show live Wingy balance and username
- ✓ Created useAuth hook for consistent authentication state management
- ✓ Enhanced transaction modal with balance verification
- ✓ Updated color scheme throughout navbar and components to use blue theme
- ✓ Integrated live transaction statistics from Wingy Coin API for home page stats
- ✓ Updated home page to show real-time total Wingy Coins traded and transaction count
- ✓ Added automatic refresh of statistics every minute to keep data current

### July 18, 2025 - Balance Display Formatting & API Method Updates  
- ✓ Updated all balance checking methods to use consistent POST /api/check-balance with userId parameter
- ✓ Fixed balance display formatting to show exactly 3 decimal places (0.000 format) throughout the application
- ✓ Updated product price displays to show 3 decimal places for consistency 
- ✓ Updated transaction amount displays to show 3 decimal places
- ✓ Updated navbar, Get Wingy page, home page dashboard, product cards, transaction modal, product modal, and my-orders page
- ✓ Fixed balance checking in Get Wingy page to use proper POST method with userId parameter
- ✓ All balance and currency displays now consistently show 3 decimal places for better precision

### July 18, 2025 - Get Wingy Page App-Focused Update
- ✓ Redesigned Get Wingy page to focus on downloading the official app from Google Play Store
- ✓ Added Play Store download button with Google Play icon
- ✓ Created QR code visual for easy mobile access to the app
- ✓ Added "Purchase Wingy Coins" section highlighting in-app payment methods (Credit/Debit, PayPal, Google Pay, Bank Transfer)
- ✓ Added step-by-step instructions for users: Download App → Sign In → Purchase Coins → Start Shopping
- ✓ Removed all other earning methods as requested (offers, referrals, daily bonuses, promotions)
- ✓ Updated page to emphasize app-only earning and purchasing approach
- ✓ Added clear messaging that coins purchased in the app will sync automatically with the website

### July 18, 2025 - Username Display Fix & User Verification System
- ✓ Fixed critical username display issue - usernames now show correctly in navbar instead of "user"
- ✓ Implemented proper username extraction from email address (part before @)
- ✓ Created user verification route (`/api/user/:id`) similar to mobile app pattern
- ✓ Added user verification effect in navbar to sync fresh data from Wingy Coin API
- ✓ Updated login response structure to match mobile app pattern with `user_metadata` object
- ✓ Fixed user lookup logic to properly find existing users by email
- ✓ Updated user creation/update process to ensure username is properly saved
- ✓ Enhanced user verification system to fetch fresh balance data and update local storage
- ✓ Implemented proper fallback handling for missing usernames
- ✓ Debug logs show username "kod.a7mad2003" is now correctly extracted and saved