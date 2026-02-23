import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: String,
  featuredImage: String,
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Page', pageSchema);