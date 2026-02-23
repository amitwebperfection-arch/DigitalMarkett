import express from 'express';
import * as productController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';
import { validateProduct } from './validation.js';
import { upload } from '../../middlewares/upload.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/related', productController.getRelatedProducts);

router.get(
  '/vendor/products',
  protect,
  restrictTo('vendor'),
  productController.getVendorProducts
);

router.get('/vendor/:id', protect, restrictTo('vendor'), productController.getVendorProduct);
router.get('/:slug', productController.getProductBySlug);


router.use(protect, restrictTo('vendor', 'admin'));

router.post('/', 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'files', maxCount: 5 }
  ]), 
  validateProduct, 
  productController.createProduct
);

router.put('/:id', 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'files', maxCount: 5 }
  ]), 
  productController.updateProduct
);

router.patch('/:id/toggle-published', productController.togglePublished);

router.delete('/:id', productController.deleteProduct);



router.use(restrictTo('admin'));
router.put('/:id/approve', productController.approveProduct);
router.put('/:id/reject', productController.rejectProduct);

export default router;