import jwt from 'jsonwebtoken';
import User from '../modules/auth/model.js';
import { JWT_SECRET } from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      // Custom message for order restriction
      if (req.user.role === 'admin' || req.user.role === 'vendor') {
        return res.status(403).json({
          success: false,
          message: 'Please create a customer account to place an order.'
        });
      }

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};