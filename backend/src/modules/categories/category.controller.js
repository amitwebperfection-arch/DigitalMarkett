import Category from './category.model.js';
import { uploadToCloudinary } from '../../config/s3.js';
import Product from '../products/model.js';


// Create category
export const createCategory = async (req, res, next) => {
  try {

    let iconUrl = null;

    // Upload icon to Cloudinary
    if (req.files?.icon?.[0]) {
      const result = await uploadToCloudinary(
        req.files.icon[0], 
        'categories/icons'
      );
      iconUrl = result.secure_url;
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

      // 2️⃣ Lookup parent category details
      {
        $lookup: {
          from: 'categories',
          localField: 'parent',
          foreignField: '_id',
          as: 'parentDetails'
        }
      },

      // 3️⃣ Add parent info
      {
        $addFields: {
          parentInfo: {
            $cond: {
              if: { $gt: [{ $size: '$parentDetails' }, 0] },
              then: { $arrayElemAt: ['$parentDetails', 0] },
              else: null
            }
          }
        }
      },

      // 4️⃣ Products join
      {
        $lookup: {
          from: 'products',
          localField: 'slug',
          foreignField: 'category',
          as: 'products'
        }
      },

      // 5️⃣ Count published products
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

      // 6️⃣ Cleanup and reshape
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          icon: 1,
          published: 1,
          order: 1,
          createdAt: 1,
          updatedAt: 1,
          count: 1,
          parent: {
            $cond: {
              if: { $ne: ['$parentInfo', null] },
              then: {
                _id: '$parentInfo._id',
                name: '$parentInfo.name',
                slug: '$parentInfo.slug'
              },
              else: null
            }
          }
        }
      },

      // 7️⃣ Sorting
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

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Update icon if new one is uploaded
    if (req.files?.icon?.[0] || req.file) {
      const file = req.files?.icon?.[0] || req.file;
      const result = await uploadToCloudinary(file, 'categories/icons');
      category.icon = result.secure_url;
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

// Get category tree (with subcategories)
export const getCategoryTree = async (req, res, next) => {
  try {
    // Get all published parent categories
    const parents = await Category.find({ parent: null, published: true })
      .sort({ order: 1, name: 1 });

    // For each parent, get its children
    const tree = await Promise.all(
      parents.map(async (parent) => {
        const children = await Category.find({ 
          parent: parent._id, 
          published: true 
        }).sort({ order: 1, name: 1 });

        return {
          ...parent.toObject(),
          subcategories: children
        };
      })
    );

    res.json({ 
      success: true, 
      categories: tree 
    });
  } catch (error) {
    console.error('❌ Error fetching category tree:', error);
    next(error);
  }
};

// Get subcategories of a parent
export const getSubcategories = async (req, res, next) => {
  try {
    const subcategories = await Category.find({ 
      parent: req.params.id,
      published: true 
    }).sort({ order: 1, name: 1 });

    res.json({ 
      success: true, 
      subcategories,
      total: subcategories.length
    });
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    next(error);
  }
};