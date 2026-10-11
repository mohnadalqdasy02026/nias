import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { GalleryService } from '../services/gallery.service.js';

export class GalleryController {
  constructor(service = new GalleryService()) {
    this.service = service;
  }

  listAlbums = asyncHandler(async (_req, res) => success(res, await this.service.listAlbums()));

  getAlbum = asyncHandler(async (req, res) =>
    success(res, await this.service.getAlbum(Number(req.params.id))));

  createAlbum = asyncHandler(async (req, res) =>
    created(res, await this.service.createAlbum(req.body)));

  updateAlbum = asyncHandler(async (req, res) =>
    success(res, await this.service.updateAlbum(Number(req.params.id), req.body)));

  removeAlbum = asyncHandler(async (req, res) => {
    await this.service.removeAlbum(Number(req.params.id));
    return success(res, { deleted: true });
  });

  listImages = asyncHandler(async (req, res) => {
    const albumId = req.query.albumId ? Number(req.query.albumId) : null;
    return success(res, await this.service.listImages(albumId));
  });

  addImage = asyncHandler(async (req, res) =>
    created(res, await this.service.addImage(Number(req.params.id), req.body)));

  updateImage = asyncHandler(async (req, res) =>
    success(res, await this.service.updateImage(Number(req.params.imageId), req.body)));

  removeImage = asyncHandler(async (req, res) => {
    await this.service.removeImage(Number(req.params.imageId));
    return success(res, { deleted: true });
  });
}
