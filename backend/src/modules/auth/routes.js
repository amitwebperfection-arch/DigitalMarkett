import express from 'express';
import * as authController from './controller.js';
import { validateRegister, validateLogin, validateChangePassword, validateOTP, validateResendOTP } from './validation.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

// Registration with OTP
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/resend-otp', validateResendOTP, authController.resendOTP);

// Login
router.post('/login', validateLogin, authController.login);

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/change-password', protect, validateChangePassword, authController.changePassword);

// ✅ ADD THIS - Get current user profile
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

export default router;