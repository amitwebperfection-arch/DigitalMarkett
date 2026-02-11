import * as authService from './service.js';
import User from './model.js';
import { sendEmail } from '../../config/mail.js';
import crypto from 'crypto';

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, accountType, businessName, description } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with user data (expires in 10 minutes)
    otpStore.set(email, {
      otp,
      name,
      password,
      accountType: accountType || 'user',
      businessName,
      description,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Email Verification - OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 10px;">Hi <strong>${name}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Your OTP for registration is:</p>
            
            <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #3b82f6; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              <strong>⏰ This OTP will expire in 10 minutes.</strong>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      text: `Hi ${name},\n\nYour OTP for registration is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Get stored OTP data
    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please register again.'
      });
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please register again.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Create user
    const userData = {
      name: otpData.name,
      email,
      password: otpData.password,
      isVerified: true,
      role: otpData.accountType === 'vendor' ? 'vendor' : 'user'
    };

    if (otpData.accountType === 'vendor') {
      userData.vendorInfo = {
        businessName: otpData.businessName,
        description: otpData.description,
        status: 'pending', 
        appliedAt: new Date()
      };
    }

    const user = await User.create(userData);

    const token = authService.generateToken(user._id);
    const refreshToken = authService.generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Clear OTP from store
    otpStore.delete(email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        vendorInfo: user.vendorInfo
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Get stored data
    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please start registration again.'
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();

    // Update OTP and expiry
    otpStore.set(email, {
      ...otpData,
      otp: newOtp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Email Verification - New OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 10px;">Hi <strong>${otpData.name}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Your new OTP for registration is:</p>
            
            <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #3b82f6; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${newOtp}</h1>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              <strong>⏰ This OTP will expire in 10 minutes.</strong>
            </p>
          </div>
        </div>
      `,
      text: `Hi ${otpData.name},\n\nYour new OTP for registration is: ${newOtp}\n\nThis OTP will expire in 10 minutes.`
    });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // ✅ FIX: Check vendorInfo status properly
    if (user.vendorInfo && user.vendorInfo.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor application is pending approval',
        vendorPending: true
      });
    }

    if (user.vendorInfo && user.vendorInfo.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor application was rejected'
      });
    }

    // ✅ Only approved vendors can login as vendors
    const token = authService.generateToken(user._id);
    const refreshToken = authService.generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        vendorInfo: user.vendorInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = authService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const newToken = authService.generateToken(user._id);
    const newRefreshToken = authService.generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    await user.save();

    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { token, hashedToken } = authService.generatePasswordResetToken();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset</h2>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 10px;">Hi <strong>${user.name}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to reset it:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              <strong>⏰ This link will expire in 10 minutes.</strong>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Hi ${user.name},\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, businessName, description } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;

    if (user.role === 'vendor' && user.vendorInfo) {
      if (businessName) user.vendorInfo.businessName = businessName;
      if (description) user.vendorInfo.description = description;
    }

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};