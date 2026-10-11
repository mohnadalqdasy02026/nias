import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { GalleryController } from '../controllers/gallery.controller.js';
import {
  albumIdParamsSchema,
  imageIdParamsSchema,
  createAlbumSchema,
  updateAlbumSchema,
  createImageSchema,
  updateImageSchema,
} from '../validators/gallery.validators.js';

const router = Router();
const galleryController = new GalleryController();

router.use(requireAuth);

router.get('/images', requirePermission('gallery.read'), galleryController.listImages);
router.patch(
  '/images/:imageId',
  validate(imageIdParamsSchema),
  validate(updateImageSchema),
  requirePermission('gallery.manage'),
  galleryController.updateImage,
);
router.delete(
  '/images/:imageId',
  validate(imageIdParamsSchema),
  requirePermission('gallery.manage'),
  galleryController.removeImage,
);

router.get('/', requirePermission('gallery.read'), galleryController.listAlbums);
router.post('/', validate(createAlbumSchema), requirePermission('gallery.manage'), galleryController.createAlbum);
router.get('/:id', validate(albumIdParamsSchema), requirePermission('gallery.read'), galleryController.getAlbum);
router.patch(
  '/:id',
  validate(albumIdParamsSchema),
  validate(updateAlbumSchema),
  requirePermission('gallery.manage'),
  galleryController.updateAlbum,
);
router.delete(
  '/:id',
  validate(albumIdParamsSchema),
  requirePermission('gallery.manage'),
  galleryController.removeAlbum,
);
router.post(
  '/:id/images',
  validate(albumIdParamsSchema),
  validate(createImageSchema),
  requirePermission('gallery.manage'),
  galleryController.addImage,
);

export default router;
