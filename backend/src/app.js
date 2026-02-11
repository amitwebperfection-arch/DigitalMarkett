import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { FRONTEND_URL } from './config/env.js';
import { errorHandler } from './middlewares/error.js';
import { rateLimiter } from './middlewares/rateLimit.js';

// Routes
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import adminRoutes from './modules/admin/routes.js';
import vendorRoutes from './modules/vendors/routes.js';
import productRoutes from './modules/products/routes.js';
import orderRoutes from './modules/orders/routes.js';
import paymentRoutes from './modules/payments/routes.js';
import licenseRoutes from './modules/licenses/routes.js';
import reviewRoutes from './modules/reviews/routes.js';
import couponRoutes from './modules/coupons/routes.js';
import walletRoutes from './modules/wallet/routes.js';
import payoutRoutes from './modules/payouts/routes.js';
import ticketRoutes from './modules/tickets/routes.js';
import cmsRoutes from './modules/cms/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import settingsRoutes from './modules/settings/routes.js';
import wishlistRoutes from './modules/wishlist/routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import contactRoutes from './modules/contact/contactRoutes.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));


// Stripe webhook must be raw
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' })
);

// Then normal JSON/body parsing for other routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(cookieParser());

// Rate limiter (webhook ke baad)
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/pages', cmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
