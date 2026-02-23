# Digital Marketplace Backend API

Complete RESTful API for a digital marketplace platform built with Node.js, Express, and MongoDB.


stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook




## 🚀 Features

### Core Features
- ✅ **JWT Authentication** - Access & Refresh tokens with automatic refresh
- ✅ **Role-Based Access Control** - Admin, Vendor, and User roles
- ✅ **Product Management** - Full CRUD operations with approval workflow
- ✅ **Order Processing** - Complete order lifecycle management
- ✅ **Payment Integration** - Stripe, Razorpay, and Wallet support
- ✅ **License Management** - Digital product licensing with activation tracking
- ✅ **Review System** - Product ratings and reviews with verified purchases
- ✅ **Coupon Management** - Percentage and fixed discount coupons
- ✅ **Wallet System** - User and vendor wallet with transaction history
- ✅ **Payout Management** - Vendor earnings and payout requests
- ✅ **Support Tickets** - Customer support ticket system
- ✅ **CMS Pages** - Dynamic page management
- ✅ **Analytics Dashboard** - Admin and vendor analytics
- ✅ **Settings Management** - Platform-wide configuration

### Security Features
- 🔒 Password hashing with bcrypt
- 🔒 JWT token authentication
- 🔒 Rate limiting on API endpoints
- 🔒 Helmet security headers
- 🔒 CORS protection
- 🔒 Audit logging for sensitive actions
- 🔒 Signed URLs for secure file downloads

### File Management
- 📁 AWS S3 integration for file storage
- 📁 Signed URLs for secure downloads
- 📁 File upload validation
- 📁 Multiple file support per product

### Email Features
- 📧 Order confirmation emails
- 📧 Vendor notification emails
- 📧 Password reset emails
- 📧 SMTP/SES support

## 📦 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Storage**: AWS S3
- **Payments**: Stripe & Razorpay
- **Email**: Nodemailer
- **Caching**: Redis
- **Security**: Helmet, CORS, bcryptjs

## 🗂️ Project Structure

```
backend/
├── server.js                 # Entry point
├── package.json             # Dependencies
├── .env                     # Environment variables
└── src/
    ├── app.js               # Express app configuration
    ├── config/              # Configuration files
    │   ├── db.js           # MongoDB connection
    │   ├── env.js          # Environment variables
    │   ├── s3.js           # AWS S3 configuration
    │   ├── payment.js      # Payment gateway setup
    │   ├── redis.js        # Redis client
    │   └── mail.js         # Email configuration
    ├── modules/             # Feature modules
    │   ├── auth/           # Authentication module
    │   │   ├── model.js    # User model
    │   │   ├── service.js  # Auth business logic
    │   │   ├── controller.js # Route controllers
    │   │   ├── routes.js   # API routes
    │   │   └── validation.js # Input validation
    │   ├── users/          # User management
    │   ├── admin/          # Admin dashboard
    │   ├── vendors/        # Vendor management
    │   ├── products/       # Product CRUD
    │   ├── orders/         # Order processing
    │   ├── payments/       # Payment processing
    │   ├── licenses/       # License management
    │   ├── reviews/        # Review system
    │   ├── coupons/        # Coupon management
    │   ├── wallet/         # Wallet system
    │   ├── payouts/        # Payout management
    │   ├── tickets/        # Support tickets
    │   ├── cms/            # CMS pages
    │   ├── analytics/      # Analytics
    │   └── settings/       # Settings
    ├── middlewares/         # Express middlewares
    │   ├── auth.js         # JWT verification
    │   ├── error.js        # Error handling
    │   ├── upload.js       # File upload
    │   ├── rateLimit.js    # Rate limiting
    │   └── auditLog.js     # Audit logging
    └── utils/               # Helper functions
        ├── slugify.js      # URL slug generation
        ├── generateLicense.js # License key generation
        ├── sendEmail.js    # Email helpers
        ├── signedUrl.js    # S3 signed URLs
        ├── calculateCommission.js # Commission calculation
        └── dateHelpers.js  # Date utilities
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB v5 or higher
- Redis (optional, for caching)
- AWS S3 account (for file storage)
- Stripe/Razorpay account (for payments)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://amitlms:%21%40%23%24%25@lms.6wc6rbx.mongodb.net/digital-new?retryWrites=true&w=majority&appName=lms

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# AWS S3
# AWS_ACCESS_KEY=your-aws-access-key
# AWS_SECRET_KEY=your-aws-secret-key
# AWS_BUCKET_NAME=your-bucket-name
# AWS_REGION=us-east-1

# Cloudinary
CLOUDINARY_CLOUD_NAME=dcaublx3n
CLOUDINARY_API_KEY=784734272515381
CLOUDINARY_API_SECRET=4ERjSmjW0EQfUtFpVQ4tHsRVfus

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email
SMTP_HOST=smtp.emailtest.dev
SMTP_PORT=2525
SMTP_USER=user_N8KNSnvopO34fDf5
SMTP_PASS=OVWBG6GdAXkWFB4KyH8Bpw
FROM_EMAIL=default-li7ldo3glnkvgwr32beucllb@local
FROM_NAME=Digital Marketplace

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App
FRONTEND_URL=http://localhost:3000
COMMISSION_RATE=0.20
```

### Step 3: Start Services

```bash
# Start MongoDB (if running locally)
mongod

# Start Redis (if using)
redis-server

# Start development server
npm run dev

# Or start production server
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh_token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### User Endpoints

#### Get My Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Get My Orders
```http
GET /api/users/orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Get My Downloads
```http
GET /api/users/downloads
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&category=wordpress-themes&minPrice=10&maxPrice=100&search=theme
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Text search
- `featured` - Filter featured products (true/false)

#### Get Product by Slug
```http
GET /api/products/:slug
```

#### Create Product (Vendor/Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Premium WordPress Theme",
  "description": "A beautiful responsive theme",
  "shortDescription": "Modern WordPress theme",
  "price": 59.99,
  "salePrice": 39.99,
  "category": "wordpress-themes",
  "tags": ["responsive", "ecommerce"],
  "demoUrl": "https://demo.example.com",
  "version": "1.0.0"
}
```

#### Update Product (Vendor/Admin)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 69.99
}
```

#### Delete Product (Vendor/Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

#### Approve Product (Admin)
```http
PUT /api/products/:id/approve
Authorization: Bearer <token>
```

#### Reject Product (Admin)
```http
PUT /api/products/:id/reject
Authorization: Bearer <token>
```

### Order Endpoints

#### Create Order
```http
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": "507f1f77bcf86cd799439011" }
  ],
  "paymentMethod": "stripe",
  "couponId": "507f1f77bcf86cd799439012"
}
```

#### Get My Orders
```http
GET /api/orders/my?page=1&limit=10
Authorization: Bearer <token>
```

#### Get All Orders (Admin)
```http
GET /api/orders/admin?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

### Payment Endpoints

#### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "method": "stripe"
}
```

#### Stripe Webhook
```http
POST /api/payments/webhook
Stripe-Signature: <signature>
Content-Type: application/json
```

#### Verify Razorpay Payment
```http
POST /api/payments/verify-razorpay
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_123"
}
```

### License Endpoints

#### Verify License
```http
POST /api/licenses/verify
Content-Type: application/json

{
  "licenseKey": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
  "domain": "example.com"
}
```

#### Get My Licenses
```http
GET /api/licenses/my
Authorization: Bearer <token>
```

#### Revoke License (Admin)
```http
PUT /api/licenses/revoke/:id
Authorization: Bearer <token>
```

### Review Endpoints

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "title": "Excellent Product!",
  "comment": "This is an amazing product..."
}
```

#### Get Product Reviews
```http
GET /api/reviews/:productId?page=1&limit=10
```

#### Delete Review (Admin)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Coupon Endpoints

#### Create Coupon (Admin)
```http
POST /api/coupons
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "minPurchase": 50,
  "maxDiscount": 100,
  "usageLimit": 100,
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

#### Apply Coupon
```http
POST /api/coupons/apply
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 100,
  "productIds": ["507f1f77bcf86cd799439011"]
}
```

#### Get All Coupons (Admin)
```http
GET /api/coupons?page=1&limit=10
Authorization: Bearer <token>
```

#### Delete Coupon (Admin)
```http
DELETE /api/coupons/:id
Authorization: Bearer <token>
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/wallet
Authorization: Bearer <token>
```

#### Add Funds
```http
POST /api/wallet/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "description": "Wallet top-up"
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?page=1&limit=20
Authorization: Bearer <token>
```

### Vendor Endpoints

#### Apply for Vendor
```http
POST /api/vendor/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "My Business",
  "description": "We sell digital products"
}
```

#### Get Vendor Dashboard
```http
GET /api/vendor/dashboard
Authorization: Bearer <token>
```

#### Get Vendor Earnings
```http
GET /api/vendor/earnings?page=1&limit=10
Authorization: Bearer <token>
```

#### Approve Vendor (Admin)
```http
PUT /api/vendor/approve/:id
Authorization: Bearer <token>
```

### Payout Endpoints

#### Request Payout (Vendor)
```http
POST /api/payouts/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "method": "bank",
  "accountDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "987654321",
    "accountName": "John Doe"
  }
}
```

#### Get My Payouts (Vendor)
```http
GET /api/payouts/vendor?page=1&limit=10
Authorization: Bearer <token>
```

#### Get All Payouts (Admin)
```http
GET /api/payouts/admin?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

#### Process Payout (Admin)
```http
PUT /api/payouts/:id/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Payment processed successfully"
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&search=john
Authorization: Bearer <token>
```

#### Ban User
```http
PUT /api/admin/user/:id/ban
Authorization: Bearer <token>
```

#### Unban User
```http
PUT /api/admin/user/:id/unban
Authorization: Bearer <token>
```

#### Delete User
```http
DELETE /api/admin/user/:id
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Admin Analytics
```http
GET /api/analytics/admin?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Vendor Analytics
```http
GET /api/analytics/vendor?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Settings Endpoints

#### Get Settings
```http
GET /api/settings
```

#### Update Settings (Admin)
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteName": "My Marketplace",
  "commissionRate": 0.15,
  "maintenanceMode": false
}
```

### Support Ticket Endpoints

#### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Payment Issue",
  "category": "billing",
  "message": "I have a problem with my payment"
}
```

#### Get My Tickets
```http
GET /api/tickets/my?page=1&limit=10
Authorization: Bearer <token>
```

#### Get All Tickets (Admin)
```http
GET /api/tickets?page=1&limit=10&status=open
Authorization: Bearer <token>
```

#### Reply to Ticket
```http
POST /api/tickets/:id/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Thank you for contacting us..."
}
```

#### Update Ticket Status (Admin)
```http
PUT /api/tickets/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved"
}
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/vendor/admin),
  avatar: String,
  isVerified: Boolean,
  isActive: Boolean,
  vendorInfo: {
    businessName: String,
    description: String,
    status: String (pending/approved/rejected),
    appliedAt: Date,
    approvedAt: Date
  },
  timestamps: true
}
```

### Product Model
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  shortDescription: String,
  price: Number,
  salePrice: Number,
  category: String,
  tags: [String],
  images: [{ url, alt }],
  thumbnail: String,
  files: [{ name, url, size, type }],
  demoUrl: String,
  version: String,
  vendor: ObjectId (ref: User),
  status: String (pending/approved/rejected),
  featured: Boolean,
  downloads: Number,
  rating: { average, count },
  timestamps: true
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    title: String,
    price: Number,
    vendorEarning: Number,
    platformFee: Number
  }],
  subtotal: Number,
  discount: Number,
  total: Number,
  paymentMethod: String (stripe/razorpay/wallet),
  paymentStatus: String (pending/completed/failed/refunded),
  paymentId: String,
  status: String (pending/completed/cancelled),
  coupon: ObjectId (ref: Coupon),
  timestamps: true
}
```

### License Model
```javascript
{
  licenseKey: String (unique),
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  order: ObjectId (ref: Order),
  status: String (active/revoked/expired),
  activations: [{ domain, ip, activatedAt }],
  maxActivations: Number,
  expiresAt: Date,
  downloadCount: Number,
  lastDownloadAt: Date,
  timestamps: true
}
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secrets**: Use strong, random secrets (min 32 characters)
3. **Password Policy**: Enforce minimum 6 characters
4. **Rate Limiting**: API rate limiting enabled
5. **CORS**: Configure allowed origins
6. **Helmet**: Security headers enabled
7. **Input Validation**: Joi validation on all inputs
8. **SQL Injection**: Using Mongoose ORM prevents SQL injection
9. **XSS Protection**: Input sanitization
10. **Audit Logging**: Track sensitive operations

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Test with Postman/Thunder Client
# Import the API collection from /docs/api-collection.json
```

## 📈 Performance Optimization

- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: All list endpoints support pagination
- **Lazy Loading**: Related data loaded on demand
- **Connection Pooling**: MongoDB connection pooling enabled

## 🚀 Deployment

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
# ... set all other environment variables

# Deploy
git push heroku main

# Open app
heroku open
```

### Railway Deployment

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### DigitalOcean Deployment

1. Create Droplet
2. Install Node.js, MongoDB, Redis
3. Clone repository
4. Set up PM2 process manager
5. Configure Nginx reverse proxy

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
systemctl status mongod

# Check connection string
echo $MONGO_URI
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### JWT Token Errors
- Verify JWT_SECRET is set correctly
- Check token expiration
- Ensure Bearer token format: `Bearer <token>`

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Use meaningful variable names
- Add comments for complex logic

### Commit Messages
```
feat: Add user registration endpoint
fix: Fix payment webhook validation
docs: Update API documentation
refactor: Optimize database queries
```

### Module Structure
Each module should follow this pattern:
```
module/
├── model.js      # Mongoose schema
├── service.js    # Business logic
├── controller.js # Request handlers
├── routes.js     # Route definitions
└── validation.js # Input validation
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@example.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Stripe & Razorpay
- All open-source contributors

---

**Built with ❤️ for the Digital Marketplace community**