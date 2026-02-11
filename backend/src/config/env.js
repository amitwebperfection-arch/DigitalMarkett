import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
export const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
export const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE) || 0.20;

// AWS
// export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
// export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
// export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;


// Payment
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Email
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const FROM_EMAIL = process.env.FROM_EMAIL;
export const FROM_NAME = process.env.FROM_NAME;

// Redis
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;