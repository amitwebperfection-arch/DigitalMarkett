import express from 'express';
import * as categoryController from './category.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';
import { validateCategory } from './category.validation.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/subcategories', categoryController.getSubcategories); 

// Protected routes (admin only)
router.use(protect, restrictTo('admin'));

router.post('/', 
  upload.single('icon'),
  validateCategory, 
  categoryController.createCategory
);

router.put('/:id', 
  upload.single('icon'),
  categoryController.updateCategory
);

router.delete('/:id', 
  categoryController.deleteCategory
);

router.post('/bulk-delete', 
  categoryController.bulkDeleteCategories
);

router.patch('/:id/toggle-published', 
  categoryController.togglePublished
);

export default router;