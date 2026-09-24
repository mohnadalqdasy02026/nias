import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { MediaRepository } from '../repositories/media.repository.js';
import { MediaService } from '../services/media.service.js';
import { MediaController } from '../controllers/media.controller.js';
import {
  listMediaSchema,
  uploadMediaSchema,
  mediaParamsSchema,
  updateMediaSchema,
} from '../validators/media.validators.js';

const router = Router();
const mediaService = new MediaService(new MediaRepository());
const mediaController = new MediaController(mediaService);

router.use(requireAuth);

router.get(
  '/',
  validate(listMediaSchema),
  requirePermission('media_library.read'),
  mediaController.list,
);

router.post(
  '/',
  validate(uploadMediaSchema),
  requirePermission('media_library.create'),
  mediaController.upload,
);

router.patch(
  '/:id',
  validate(updateMediaSchema),
  requirePermission('media_library.update'),
  mediaController.update,
);

router.delete(
  '/:id',
  validate(mediaParamsSchema),
  requirePermission('media_library.delete'),
  mediaController.remove,
);

export default router;