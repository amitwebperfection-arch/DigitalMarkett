import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String, 
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  tags: [String],
  images: [{
    url: String,
    alt: String
  }],
  thumbnail: String,
  files: [
    {
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      size: {
        type: Number
      },
      type: {
        type: String
      }
    }
  ],
  demoUrl: String,
  documentation: String,
  changelog: [{
    version: String,
    date: Date,
    changes: [String]
  }],
  version: {
    type: String,
    default: '1.0.0'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  // ✅ FIXED: Make rating always present and default to 0
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  requirements: {
    type: String
  },
  compatibleWith: [String],
  supportedUntil: Date
}, {
  timestamps: true,
  // ✅ IMPORTANT: Ensure rating is included in JSON output
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure rating exists
      if (!ret.rating) {
        ret.rating = { average: 0, count: 0 };
      }
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure rating exists
      if (!ret.rating) {
        ret.rating = { average: 0, count: 0 };
      }
      return ret;
    }
  }
});

// ✅ Add default value middleware
productSchema.pre('save', function(next) {
  // Ensure rating exists before saving
  if (!this.rating) {
    this.rating = { average: 0, count: 0 };
  }
  next();
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1, published: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ featured: 1 });

export default mongoose.model('Product', productSchema);