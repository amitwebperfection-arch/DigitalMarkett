import { OAuth2Client } from 'google-auth-library';
import User from './model.js';
import * as authService from './service.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not found in Google account' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
      if (user.vendorInfo?.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your vendor application is pending approval',
          vendorPending: true
        });
      }
      if (user.vendorInfo?.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your vendor application was rejected'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        isVerified: true,
        role: 'user',
      });
    }

    const token = authService.generateToken(user._id);
    const refreshToken = authService.generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        vendorInfo: user.vendorInfo
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    if (error.message?.includes('Token used too late')) {
      return res.status(401).json({ success: false, message: 'Google token expired. Please try again.' });
    }
    next(error);
  }
};