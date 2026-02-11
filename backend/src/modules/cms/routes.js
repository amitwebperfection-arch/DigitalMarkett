import express from 'express';
import * as cmsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/:slug', cmsController.getPageBySlug);

router.use(protect, restrictTo('admin'));
router.post('/', cmsController.createPage);
router.get('/', cmsController.getPages);
router.put('/:id', cmsController.updatePage);
router.delete('/:id', cmsController.deletePage);

export default router;