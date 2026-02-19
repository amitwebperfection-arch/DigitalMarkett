import express from 'express';
import * as cmsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

// Public route
router.get('/slug/:slug', cmsController.getPageBySlug); // ← /slug/ prefix add kiya

// Admin routes
router.use(protect, restrictTo('admin'));
router.post('/', cmsController.createPage);
router.get('/', cmsController.getPages);
router.get('/:id', cmsController.getPageById); // ← ab direct /:id kaam karega
router.put('/:id', cmsController.updatePage);
router.delete('/:id', cmsController.deletePage);

export default router;