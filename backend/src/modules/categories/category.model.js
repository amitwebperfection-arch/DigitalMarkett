import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Icon is required']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  published: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

categorySchema.virtual('id').get(function() {
  return this._id.toString().slice(-4).toUpperCase();
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const slugify = (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    };
    
    let slug = slugify(this.name);
    let slugExists = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
    
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(this.name)}-${counter}`;
      slugExists = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

export default mongoose.model('Category', categorySchema);