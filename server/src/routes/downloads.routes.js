import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DownloadsController } from '../controllers/downloads.controller.js';
import {
  downloadIdParamsSchema,
  createDownloadSchema,
  updateDownloadSchema,
} from '../validators/downloads.validators.js';

const router = Router();
const downloadsController = new DownloadsController();

router.use(requireAuth);

router.get('/', requirePermission('downloads.read'), downloadsController.list);
router.post(
  '/',
  validate(createDownloadSchema),
  requirePermission('downloads.create'),
  downloadsController.create,
);
router.get('/:id', validate(downloadIdParamsSchema), requirePermission('downloads.read'), downloadsController.get);
router.patch(
  '/:id',
  validate(downloadIdParamsSchema),
  validate(updateDownloadSchema),
  requirePermission('downloads.update'),
  downloadsController.update,
);
router.delete(
  '/:id',
  validate(downloadIdParamsSchema),
  requirePermission('downloads.delete'),
  downloadsController.remove,
);

export default router;
