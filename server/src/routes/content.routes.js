import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ContentController } from '../controllers/content.controller.js';
import {
  listNewsSchema,
  createNewsSchema,
  updateNewsSchema,
  getNewsAdminParams,
  createCategorySchema,
  updateCategorySchema,
  categoryParams,
  createPageSchema,
  updatePageSchema,
  getPageAdminParams,
} from '../validators/content.validators.js';

const router = Router();
const content = new ContentController();

router.use(requireAuth);

// News
router.get(
  '/news',
  validate(listNewsSchema),
  requirePermission('news.read'),
  content.listNews,
);
router.get(
  '/news/:id',
  validate(getNewsAdminParams),
  requirePermission('news.read'),
  content.getNews,
);
router.post(
  '/news',
  validate(createNewsSchema),
  requirePermission('news.create'),
  content.createNews,
);
router.patch(
  '/news/:id',
  validate(updateNewsSchema),
  requirePermission('news.update'),
  content.updateNews,
);
router.delete(
  '/news/:id',
  validate(getNewsAdminParams),
  requirePermission('news.delete'),
  content.deleteNews,
);

// News categories
router.get('/news-categories', requirePermission('news_categories.read'), content.listCategories);
router.post(
  '/news-categories',
  validate(createCategorySchema),
  requirePermission('news_categories.create'),
  content.createCategory,
);
router.patch(
  '/news-categories/:id',
  validate(updateCategorySchema),
  requirePermission('news_categories.update'),
  content.updateCategory,
);
router.delete(
  '/news-categories/:id',
  validate(categoryParams),
  requirePermission('news_categories.delete'),
  content.deleteCategory,
);

// Static pages
router.get('/pages', requirePermission('site_pages.read'), content.listPages);
router.get(
  '/pages/:id',
  validate(getPageAdminParams),
  requirePermission('site_pages.read'),
  content.getPage,
);
router.post(
  '/pages',
  validate(createPageSchema),
  requirePermission('site_pages.create'),
  content.createPage,
);
router.patch(
  '/pages/:id',
  validate(updatePageSchema),
  requirePermission('site_pages.update'),
  content.updatePage,
);
router.delete(
  '/pages/:id',
  validate(getPageAdminParams),
  requirePermission('site_pages.delete'),
  content.deletePage,
);

export default router;