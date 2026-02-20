import * as productService from './service.js';
import { uploadToCloudinary } from '../../config/s3.js';
import Product from './model.js';

export const createProduct = async (req, res, next) => {
  try {

    const uploadedData = {
      thumbnail: null,
      images: [],
      files: []
    };

    if (req.files?.thumbnail?.[0]) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0], 
        'products/thumbnails'
      );
      uploadedData.thumbnail = result.secure_url;
    }

    if (req.files?.images?.length > 0) {
      const imagePromises = req.files.images.map(file => 
        uploadToCloudinary(file, 'products/gallery')
      );
      const imageResults = await Promise.all(imagePromises);
      uploadedData.images = imageResults.map(result => ({
        url: result.secure_url,
        alt: req.body.title || 'Product image'
      }));
    }

    if (req.files?.files?.length > 0) {
      const filePromises = req.files.files.map(file => 
        uploadToCloudinary(file, 'products/files')
      );
      const fileResults = await Promise.all(filePromises);
      uploadedData.files = fileResults.map((result, index) => ({
        name: req.files.files[index].originalname,
        url: result.secure_url,
        size: req.files.files[index].size,
        type: req.files.files[index].mimetype
      }));
    }

    let changelog = [];
    if (req.body.changelog) {
      try {
        changelog = JSON.parse(req.body.changelog);
      } catch (e) {
        console.error('Failed to parse changelog:', e);
      }
    }

    const productData = {
      ...req.body,
      thumbnail: uploadedData.thumbnail,
      images: uploadedData.images,
      files: uploadedData.files,
      changelog
    };

    const product = await productService.createProduct(productData, req.user.id);

    res.status(201).json({ 
      success: true, 
      product 
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const products = await productService.getRelatedProducts(category, 4);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {

    const uploadedData = {};

    if (req.files?.thumbnail?.[0]) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0], 
        'products/thumbnails'
      );
      uploadedData.thumbnail = result.secure_url;
    }

    if (req.files?.images?.length > 0) {
      const imagePromises = req.files.images.map(file => 
        uploadToCloudinary(file, 'products/gallery')
      );
      const imageResults = await Promise.all(imagePromises);
      uploadedData.images = imageResults.map(result => ({
        url: result.secure_url,
        alt: req.body.title || 'Product image'
      }));
    }

    if (req.files?.files?.length > 0) {
      const filePromises = req.files.files.map(file => 
        uploadToCloudinary(file, 'products/files')
      );
      const fileResults = await Promise.all(filePromises);
      uploadedData.files = fileResults.map((result, index) => ({
        name: req.files.files[index].originalname,
        url: result.secure_url,
        size: req.files.files[index].size,
        type: req.files.files[index].mimetype
      }));
    }

    if (req.body.changelog) {
      try {
        uploadedData.changelog = JSON.parse(req.body.changelog);
      } catch (e) {
        console.error('Failed to parse changelog:', e);
      }
    }

    const updates = {
      ...req.body,
      ...uploadedData
    };

    const product = await productService.updateProduct(
      req.params.id, 
      req.user.id, 
      updates
    );
    
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const approveProduct = async (req, res, next) => {
  try {
    const product = await productService.approveProduct(req.params.id);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const rejectProduct = async (req, res, next) => {
  try {
    const product = await productService.rejectProduct(req.params.id);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const getVendorProduct = async (req, res) => {
  const product = await productService.getVendorProductById(
    req.params.id,
    req.user.id
  );
  res.json({ success: true, product });
};

export const togglePublished = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (
      req.user.role === 'vendor' &&
      product.vendor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    product.published = !product.published;

    await product.save();

    res.json({
      success: true,
      product,
      published: product.published,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const query = { vendor: req.user._id }; 

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, ...filters } = req.query;
    const result = await productService.getProducts(filters, Number(page), Number(limit));
    
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
