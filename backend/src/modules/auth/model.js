import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true  
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  avatar: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  vendorInfo: {
    businessName: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: Date,
    approvedAt: Date
  },
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  hasBankDetails: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; 
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);