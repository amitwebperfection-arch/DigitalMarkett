import Category from './category.model.js';
import { uploadToCloudinary } from '../../config/s3.js';
import Product from '../products/model.js';


// Create category
export const createCategory = async (req, res, next) => {
  try {
    console.log('📁 Files received:', req.files);
    console.log('📝 Body data:', req.body);

    let iconUrl = null;

    // Upload icon to Cloudinary
    if (req.files?.icon?.[0]) {
      console.log('☁️ Uploading category icon...');
      const result = await uploadToCloudinary(
        req.files.icon[0], 
        'categories/icons'
      );
      iconUrl = result.secure_url;
      console.log('✅ Icon uploaded:', iconUrl);
    } else if (req.file) {
      // Handle single file upload
      const result = await uploadToCloudinary(
        req.file, 
        'categories/icons'
      );
      iconUrl = result.secure_url;
    }

    if (!iconUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Icon is required' 
      });
    }

    // Create category
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description,
      icon: iconUrl,
      published: req.body.published === 'true' || req.body.published === true,
      parent: req.body.parent || null
    });

    console.log('✅ Category created:', category._id);

    res.status(201).json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A category with this name already exists' 
      });
    }
    
    next(error);
  }
};

// Get all categories
// export const getCategories = async (req, res, next) => {
//   try {
//     const { search, published, parent } = req.query;

//     const query = {};

    
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

    
//     if (published !== undefined) {
//       query.published = published === 'true';
//     }

    
//     if (parent === 'null' || parent === 'only') {
//       query.parent = null;
//     }

//     const categories = await Category.find(query)
//       .populate('parent', 'name')
//       .sort({ order: 1, createdAt: -1 });

//     res.json({ 
//       success: true, 
//       categories,
//       total: categories.length
//     });
//   } catch (error) {
//     console.error('❌ Error fetching categories:', error);
//     next(error);
//   }
// };

export const getCategories = async (req, res, next) => {
  try {
    const { search, published, parent } = req.query;

    const matchStage = {};

    // 🔍 Search filter
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 📢 Published filter
    if (published !== undefined) {
      matchStage.published = published === 'true';
    }

    // 🌳 Parent filter
    if (parent === 'null' || parent === 'only') {
      matchStage.parent = null;
    }

    const categories = await Category.aggregate([
      // 1️⃣ Category filters
      { $match: matchStage },

      // 2️⃣ Products join
      {
        $lookup: {
          from: 'products',          // 🔴 MongoDB collection name
          localField: 'slug',         // category.slug
          foreignField: 'category',   // product.category
          as: 'products'
        }
      },

      // 3️⃣ Sirf published products ka count
      {
        $addFields: {
          count: {
            $size: {
              $filter: {
                input: '$products',
                as: 'p',
                cond: { $eq: ['$$p.published', true] }
              }
            }
          }
        }
      },

      // 4️⃣ Cleanup
      {
        $project: {
          products: 0
        }
      },

      // 5️⃣ Sorting
      {
        $sort: { order: 1, createdAt: -1 }
      }
    ]);

    res.json({
      success: true,
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    next(error);
  }
};
// Get single category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name icon');

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    next(error);
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name icon slug');

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    next(error);
  }
};

// Update category
export const updateCategory = async (req, res, next) => {
  try {
    console.log('📝 Update - Body data:', req.body);
    console.log('📁 Update - Files received:', req.files || req.file);

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Update icon if new one is uploaded
    if (req.files?.icon?.[0] || req.file) {
      console.log('☁️ Uploading new category icon...');
      const file = req.files?.icon?.[0] || req.file;
      const result = await uploadToCloudinary(file, 'categories/icons');
      category.icon = result.secure_url;
      console.log('✅ New icon uploaded:', category.icon);
    }

    // Update other fields
    if (req.body.name) category.name = req.body.name;
    if (req.body.description) category.description = req.body.description;
    if (req.body.published !== undefined) {
      category.published = req.body.published === 'true' || req.body.published === true;
    }
    if (req.body.parent !== undefined) {
      category.parent = req.body.parent || null;
    }
    if (req.body.order !== undefined) {
      category.order = Number(req.body.order);
    }

    await category.save();

    console.log('✅ Category updated:', category._id);

    res.json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error('❌ Error updating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A category with this name already exists' 
      });
    }
    
    next(error);
  }
};

// Delete category
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parent: category._id });
    
    if (hasChildren) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with subcategories. Delete subcategories first.' 
      });
    }

    await category.deleteOne();

    console.log('✅ Category deleted:', category._id);

    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    next(error);
  }
};

// Bulk delete categories
export const bulkDeleteCategories = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No category IDs provided' 
      });
    }

    // Check if any category has children
    const hasChildren = await Category.exists({ 
      parent: { $in: ids } 
    });
    
    if (hasChildren) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete categories with subcategories' 
      });
    }

    const result = await Category.deleteMany({ _id: { $in: ids } });

    console.log(`✅ ${result.deletedCount} categories deleted`);

    res.json({ 
      success: true, 
      message: `${result.deletedCount} categories deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error bulk deleting categories:', error);
    next(error);
  }
};

// Toggle category published status
export const togglePublished = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    category.published = !category.published;
    await category.save();

    res.json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error('❌ Error toggling published status:', error);
    next(error);
  }
};
