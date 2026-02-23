import express from 'express';
import * as authController from './controller.js';
import { googleAuth } from './google.controller.js';
import { validateRegister, validateLogin, validateChangePassword, validateOTP, validateResendOTP } from './validation.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();


router.post('/google', googleAuth);


router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/resend-otp', validateResendOTP, authController.resendOTP);


router.post('/login', validateLogin, authController.login);


router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);


router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/change-password', protect, validateChangePassword, authController.changePassword);


router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

export default router;