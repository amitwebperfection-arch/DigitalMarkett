import Product from './model.js';
import { slugify } from '../../utils/slugify.js';
import Category from '../categories/category.model.js';
import Review from '../reviews/model.js';

export const createProduct = async (productData, vendorId) => {
  const slug = slugify(productData.title);
  
  // Handle tags if string
  if (typeof productData.tags === 'string') {
    productData.tags = productData.tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  // Handle compatibleWith if string
  if (typeof productData.compatibleWith === 'string') {
    productData.compatibleWith = productData.compatibleWith
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  // Convert featured to boolean
  if (typeof productData.featured === 'string') {
    productData.featured = productData.featured === 'true';
  }

  // ✅ FIX: Validate category exists and convert to slug if needed
  if (productData.category) {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productData.category);
    
    let query;
    if (isValidObjectId) {
      query = {
        $or: [
          { _id: productData.category },
          { slug: productData.category },
          { name: productData.category }
        ]
      };
    } else {
      query = {
        $or: [
          { slug: productData.category },
          { name: productData.category }
        ]
      };
    }

    const category = await Category.findOne(query);

    if (category) {
      productData.category = category.slug;
    } else {
      console.warn('⚠️ Category not found:', productData.category);
    }
  }
  
  console.log('💾 Saving to DB:', {
    ...productData,
    slug,
    vendor: vendorId
  });
  
  const product = await Product.create({
    ...productData,
    slug,
    vendor: vendorId,
    // Initialize rating
    rating: {
      average: 0,
      count: 0
    }
  });

  console.log('✅ Product saved with thumbnail:', product.thumbnail);

  return product;
};

export const getProducts = async (filters = {}, page = 1, limit = 12) => {
  const { category, search, minPrice, maxPrice, featured, status, vendor, published } = filters;

  const query = {};

  // ✅ FIX: Filter by vendor if provided
  if (vendor) {
    query.vendor = vendor;
  }

  // ✅ NEW: Filter by published status if provided
  if (published !== undefined) {
    query.published = published === 'true' || published === true;
  }

  if (status) {
    query.status = status;
  }

  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  // ✅ CRITICAL: For public product listings, only show approved & published
  // This happens when vendor filter is NOT present (public page)
  if (!vendor) {
    query.status = 'approved';
    query.published = true;
  }

  const products = await Product.find(query)
    .select('+rating')
    .populate('vendor', 'name email vendorInfo.businessName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const productsWithRating = products.map(product => ({
    ...product,
    rating: product.rating || { average: 0, count: 0 }
  }));

  const total = await Product.countDocuments(query);

  const pendingCount = await Product.countDocuments({ status: 'pending' });
  const approvedCount = await Product.countDocuments({ status: 'approved' });
  const rejectedCount = await Product.countDocuments({ status: 'rejected' });

  return { 
    products: productsWithRating, 
    total, 
    page, 
    pages: Math.ceil(total / limit),
    pendingCount,
    approvedCount,
    rejectedCount
  };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, status: 'approved' })
    .select('+rating') // Ensure rating is included
    .populate('vendor', 'name vendorInfo.businessName avatar')
    .lean();

  if (!product) {
    return null;
  }

  // ✅ Ensure rating exists
  return {
    ...product,
    rating: product.rating || { average: 0, count: 0 }
  };
};

export const updateProduct = async (productId, vendorId, updates) => {
  const product = await Product.findOne({ _id: productId, vendor: vendorId });

  if (!product) {
    throw new Error('Product not found or unauthorized');
  }

  // Handle arrays from strings
  if (typeof updates.tags === 'string') {
    updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  if (typeof updates.compatibleWith === 'string') {
    updates.compatibleWith = updates.compatibleWith
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  if (typeof updates.featured === 'string') {
    updates.featured = updates.featured === 'true';
  }

  // ✅ FIX: Validate category exists and convert to slug if needed
  if (updates.category) {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(updates.category);
    
    let query;
    if (isValidObjectId) {
      query = {
        $or: [
          { _id: updates.category },
          { slug: updates.category },
          { name: updates.category }
        ]
      };
    } else {
      query = {
        $or: [
          { slug: updates.category },
          { name: updates.category }
        ]
      };
    }

    const category = await Category.findOne(query);

    if (category) {
      updates.category = category.slug;
    }
  }

  // Merge images and files (append new ones, don't replace)
  if (updates.images?.length > 0) {
    updates.images = [...(product.images || []), ...updates.images];
  }

  if (updates.files?.length > 0) {
    updates.files = [...(product.files || []), ...updates.files];
  }

  Object.assign(product, updates);
  await product.save();

  return product;
};

export const deleteProduct = async (productId, vendorId) => {
  const product = await Product.findOneAndDelete({ _id: productId, vendor: vendorId });

  if (!product) {
    throw new Error('Product not found or unauthorized');
  }

  return product;
};

export const approveProduct = async (productId) => {
  return await Product.findByIdAndUpdate(
    productId,
    { status: 'approved' },
    { new: true }
  );
};

export const rejectProduct = async (productId) => {
  return await Product.findByIdAndUpdate(
    productId,
    { status: 'rejected' },
    { new: true }
  );
};

export const getVendorProductById = async (productId, vendorId) => {
  const product = await Product.findOne({
    _id: productId,
    vendor: vendorId
  });

  if (!product) {
    throw new Error('Product not found or unauthorized');
  }

  return product;
};

export const getRelatedProducts = async (category, limit = 4) => {
  const products = await Product.find({
    category,
    status: 'approved',
    published: true
  })
    .select('+rating') // Ensure rating is included
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  // ✅ Ensure rating exists on all products
  return products.map(product => ({
    ...product,
    rating: product.rating || { average: 0, count: 0 }
  }));
};