# Digital Marketplace Frontend

Modern, responsive React application for a digital marketplace platform with admin, vendor, and user dashboards.

## 🚀 Features

### Core Features
- ✅ **Authentication System** - Login, Register, Forgot Password
- ✅ **Protected Routes** - Role-based access control (Admin/Vendor/User)
- ✅ **Product Browsing** - Advanced filtering, search, and pagination
- ✅ **Shopping Cart** - Add to cart, manage items, apply coupons
- ✅ **Checkout Process** - Multiple payment methods (Stripe, Razorpay, Wallet)
- ✅ **Order Management** - View order history and track status
- ✅ **License Downloads** - Secure digital product downloads
- ✅ **Review System** - Rate and review purchased products
- ✅ **User Dashboard** - Profile, orders, downloads, wallet
- ✅ **Vendor Dashboard** - Product management, earnings, analytics
- ✅ **Admin Dashboard** - User management, product approval, analytics

### Technical Features
- ⚡ **Vite** - Lightning fast build tool
- ⚡ **React 18** - Latest React features with concurrent rendering
- ⚡ **React Router v6** - Client-side routing with lazy loading
- ⚡ **Redux Toolkit** - Efficient state management
- ⚡ **React Query** - Server state management with caching
- ⚡ **Tailwind CSS** - Utility-first styling
- ⚡ **Code Splitting** - Lazy loaded components for better performance
- ⚡ **Toast Notifications** - User-friendly notifications
- ⚡ **Responsive Design** - Mobile-first approach
- ⚡ **Form Validation** - Client-side validation

## 📦 Tech Stack

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.4",
  "@tanstack/react-query": "^5.14.2",
  "axios": "^1.6.2"
}
```

### UI Libraries
```json
{
  "lucide-react": "^0.263.1",
  "react-hot-toast": "^2.4.1",
  "react-hook-form": "^7.49.2",
  "date-fns": "^3.0.0",
  "recharts": "^2.10.3"
}
```

### Development Tools
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16"
}
```

## 🗂️ Project Structure

```
frontend/
├── index.html               # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── .env                    # Environment variables
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component
    ├── routes/             # Route configuration
    │   ├── index.jsx       # Main routes
    │   └── ProtectedRoute.jsx # Protected route wrapper
    ├── layouts/            # Layout components
    │   ├── PublicLayout.jsx    # Public pages layout
    │   ├── AuthLayout.jsx      # Auth pages layout
    │   ├── AdminLayout.jsx     # Admin dashboard layout
    │   ├── VendorLayout.jsx    # Vendor dashboard layout
    │   └── UserLayout.jsx      # User dashboard layout
    ├── pages/              # Page components
    │   ├── public/         # Public pages
    │   │   ├── Home.jsx
    │   │   ├── ProductList.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Cart.jsx
    │   │   └── Checkout.jsx
    │   ├── auth/           # Authentication pages
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── admin/          # Admin pages
    │   │   ├── Dashboard.jsx
    │   │   ├── Users.jsx
    │   │   ├── Products.jsx
    │   │   └── Orders.jsx
    │   ├── vendor/         # Vendor pages
    │   │   ├── Dashboard.jsx
    │   │   ├── Products.jsx
    │   │   ├── AddProduct.jsx
    │   │   └── Earnings.jsx
    │   ├── user/           # User pages
    │   │   ├── Dashboard.jsx
    │   │   ├── Orders.jsx
    │   │   ├── Downloads.jsx
    │   │   └── Profile.jsx
    │   └── errors/         # Error pages
    │       └── NotFound.jsx
    ├── components/         # Reusable components
    │   ├── common/         # Common components
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Header.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Table.jsx
    │   │   └── Pagination.jsx
    │   └── products/       # Product components
    │       ├── ProductCard.jsx
    │       └── ProductFilters.jsx
    ├── features/           # Redux slices
    │   ├── auth/
    │   │   └── auth.slice.js
    │   ├── cart/
    │   │   └── cart.slice.js
    │   └── settings/
    │       └── settings.slice.js
    ├── services/           # API services
    │   ├── api.js          # Axios instance
    │   ├── auth.service.js
    │   ├── product.service.js
    │   ├── order.service.js
    │   ├── user.service.js
    │   ├── admin.service.js
    │   ├── vendor.service.js
    │   └── payment.service.js
    ├── store/              # Redux store
    │   └── index.js
    ├── hooks/              # Custom hooks
    ├── utils/              # Utility functions
    ├── constants/          # Constants
    ├── assets/             # Static assets
    └── styles/             # Global styles
        └── globals.css
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Backend API running

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Digital Marketplace
VITE_STRIPE_PUBLISHABLE_KEY=

```

### Step 3: Start Development Server

```bash
# Start development server
npm run dev

# Application will open at http://localhost:3000
```

## 🏗️ Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Drag and drop 'dist' folder to Netlify
# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

## 🎨 Features & Pages

### Public Pages

#### Home Page (`/`)
- Hero section with CTA
- Featured products showcase
- Feature highlights
- Call-to-action sections

#### Product List (`/products`)
- Grid/List view toggle
- Advanced filtering
  - Category filter
  - Price range
  - Search functionality
- Pagination
- Sort options

#### Product Details (`/products/:slug`)
- Image gallery
- Product information
- Reviews and ratings
- Add to cart button
- Related products
- Demo link

#### Shopping Cart (`/cart`)
- Cart items list
- Quantity adjustment
- Remove items
- Subtotal calculation
- Coupon application
- Checkout button

#### Checkout (`/checkout`)
- Order summary
- Payment method selection
  - Credit/Debit Card (Stripe)
  - Razorpay
  - Wallet
- Order placement

### Authentication Pages

#### Login (`/login`)
- Email/password login
- Remember me option
- Forgot password link
- Social login (optional)
- Registration link

#### Register (`/register`)
- Name, email, password fields
- Password confirmation
- Terms acceptance
- Auto-login after registration

### Admin Dashboard (`/admin/*`)

#### Dashboard (`/admin/dashboard`)
- Statistics cards
  - Total Users
  - Total Vendors
  - Total Products
  - Total Orders
  - Monthly Revenue
- Recent activity
- Quick actions

#### Users Management (`/admin/users`)
- User list with pagination
- Search functionality
- User details
- Ban/Unban users
- Delete users
- Role management

#### Products Management (`/admin/products`)
- Pending products list
- Approve/Reject products
- Product details
- Edit/Delete products
- Featured products management

#### Orders Management (`/admin/orders`)
- All orders list
- Order details
- Order status tracking
- Payment status
- Customer information

### Vendor Dashboard (`/vendor/*`)

#### Dashboard (`/vendor/dashboard`)
- Earnings overview
- Total products
- Active products
- Recent sales
- Top products

#### Products Management (`/vendor/products`)
- My products list
- Add new product
- Edit product
- Delete product
- Product status (pending/approved/rejected)
- Downloads count

#### Add Product (`/vendor/products/add`)
- Product information form
  - Title
  - Description
  - Price & Sale price
  - Category
  - Tags
  - Demo URL
  - Version
- Image upload
- File upload
- Submit for approval

#### Earnings (`/vendor/earnings`)
- Total earnings display
- Earnings history
- Transaction details
- Date filtering
- Export functionality

### User Dashboard (`/user/*`)

#### Dashboard (`/user/dashboard`)
- Welcome message
- Quick links
  - My Orders
  - Downloads
  - Wishlist
  - Wallet
  - Profile

#### Orders (`/user/orders`)
- Order history
- Order details
- Download invoices
- Track orders
- Reorder functionality

#### Downloads (`/user/downloads`)
- Purchased products
- Download buttons
- License keys
- Download history
- Version updates

#### Profile (`/user/profile`)
- Personal information
- Update name
- Change password
- Avatar upload
- Account settings

## 🧩 Component Architecture

### Layout Components

#### PublicLayout
```jsx
<Navbar />
<main>
  <Outlet /> {/* Child routes */}
</main>
<Footer />
```

#### Dashboard Layouts
```jsx
<Sidebar menuItems={...} />
<Header title="..." />
<main>
  <Outlet /> {/* Child routes */}
</main>
```

### Common Components

#### Navbar
- Logo and branding
- Navigation links
- Search bar
- Cart icon with badge
- User dropdown menu
- Responsive mobile menu

#### Sidebar
- Dynamic menu items
- Active route highlighting
- Icon support (Lucide React)
- Collapsible on mobile

#### Table
- Column configuration
- Loading state
- Empty state
- Row actions
- Sorting (optional)
- Selection (optional)

#### Modal
- Configurable size
- Close on overlay click
- Header with title
- Body content
- Footer actions

#### LoadingSpinner
- Fullscreen option
- Size variants (sm, md, lg)
- Customizable colors

#### Pagination
- Page numbers
- Previous/Next buttons
- Current page highlight
- Disabled state handling

### Product Components

#### ProductCard
- Product image
- Title and price
- Rating display
- Sale badge
- Add to cart button
- Wishlist button

#### ProductFilters
- Category selection
- Price range slider
- Search input
- Sort dropdown
- Reset filters

## 🔄 State Management

### Redux Slices

#### Auth Slice
```javascript
{
  user: null,
  token: null,
  isAuthenticated: false
}
```

**Actions:**
- `setUser` - Set user and token
- `logout` - Clear auth state
- `updateUser` - Update user info

#### Cart Slice
```javascript
{
  items: [],
  total: 0
}
```

**Actions:**
- `addToCart` - Add item to cart
- `removeFromCart` - Remove item
- `clearCart` - Empty cart
- `calculateTotal` - Calculate total price

#### Settings Slice
```javascript
{
  theme: 'light',
  currency: 'USD'
}
```

**Actions:**
- `setTheme` - Change theme
- `setCurrency` - Change currency

### React Query Cache

All API calls are cached using React Query:

```javascript
const { data, isLoading } = useQuery({
  queryKey: ['products', page, filters],
  queryFn: () => productService.getProducts({ page, filters }),
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

**Query Keys:**
- `['products']` - Product list
- `['product', slug]` - Single product
- `['user-orders']` - User orders
- `['admin-dashboard']` - Admin stats
- `['vendor-earnings']` - Vendor earnings

## 🎯 Routing Strategy

### Public Routes (No Authentication)
- `/` - Home
- `/products` - Product listing
- `/products/:slug` - Product details
- `/login` - Login page
- `/register` - Registration

### Protected Routes

#### User Routes
- `/user/dashboard`
- `/user/orders`
- `/user/downloads`
- `/user/profile`

#### Vendor Routes
- `/vendor/dashboard`
- `/vendor/products`
- `/vendor/products/add`
- `/vendor/earnings`

#### Admin Routes
- `/admin/dashboard`
- `/admin/users`
- `/admin/products`
- `/admin/orders`

### Route Protection
```jsx
<ProtectedRoute roles={['admin']}>
  <AdminLayout />
</ProtectedRoute>
```

## 🎨 Styling Guide

### Tailwind Utility Classes

#### Buttons
```javascript
// Primary button
className="btn-primary"
// bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700

// Secondary button
className="btn-secondary"
// bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300

// Outline button
className="btn-outline"
// border border-primary-600 text-primary-600 px-4 py-2 rounded-lg
```

#### Input Fields
```javascript
className="input"
// w-full px-4 py-2 border border-gray-300 rounded-lg 
// focus:outline-none focus:ring-2 focus:ring-primary-500
```

#### Cards
```javascript
className="card"
// bg-white rounded-lg shadow-sm p-6 border border-gray-200
```

#### Container
```javascript
className="container-custom"
// max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Color Palette
```javascript
primary: {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
}
```

## 🔌 API Integration

### Axios Configuration

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Layer Example

```javascript
// src/services/product.service.js
export const productService = {
  getProducts: async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getProductBySlug: async (slug) => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  }
};
```

## ⚡ Performance Optimization

### Code Splitting
```javascript
// Lazy load pages
const Home = lazy(() => import('../pages/public/Home'));
const ProductList = lazy(() => import('../pages/public/ProductList'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner fullScreen />}>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</Suspense>
```

### Image Optimization
- Use appropriate image formats (WebP)
- Lazy load images below the fold
- Use responsive images

### React Query Caching
- Cache API responses
- Automatic background refetch
- Stale-while-revalidate pattern

### Bundle Optimization
- Tree shaking enabled
- Code splitting by route
- Dynamic imports
- Minification in production

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Test coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

### API Connection Issues
```bash
# Check .env file
cat .env

# Verify backend is running
curl http://localhost:5000/health
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install
```

## 📱 Responsive Design

### Breakpoints
```javascript
// Tailwind breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X Extra large
```

### Mobile-First Approach
```jsx
// Default: mobile
// md: tablet
// lg: desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

## 🔐 Security

### XSS Protection
- React auto-escapes content
- Sanitize user inputs
- Use `dangerouslySetInnerHTML` carefully

### CSRF Protection
- CORS configured
- Same-site cookies
- Token validation

### Secure Storage
- JWT in memory/localStorage
- Never store sensitive data in localStorage
- Clear auth on logout

## 🚀 Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Build project: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Configure environment variables on hosting platform
- [ ] Set up custom domain
- [ ] Configure HTTPS
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN
- [ ] Test all features in production

## 📝 Development Guidelines

### Component Naming
- PascalCase for components: `ProductCard.jsx`
- camelCase for utilities: `formatPrice.js`
- kebab-case for CSS files: `product-card.css`

### File Organization
- Group by feature, not by type
- Keep components close to where they're used
- Use index files for cleaner imports

