import { GalleryRepository } from '../repositories/gallery.repository.js';
import { AppError } from '../utils/AppError.js';

export class GalleryService {
  constructor(repo = new GalleryRepository()) {
    this.repo = repo;
  }

  async listAlbums() {
    return this.repo.listAlbums();
  }

  async getAlbum(id) {
    const album = await this.repo.findAlbumById(id);
    if (!album) throw AppError.notFound('الألبوم غير موجود.');
    album.images = await this.repo.listItems(id);
    return album;
  }

  async createAlbum(data) {
    return this.repo.createAlbum(data);
  }

  async updateAlbum(id, data) {
    const album = await this.repo.findAlbumById(id);
    if (!album) throw AppError.notFound('الألبوم غير موجود.');
    return this.repo.updateAlbum(id, data);
  }

  async removeAlbum(id) {
    const album = await this.repo.findAlbumById(id);
    if (!album) throw AppError.notFound('الألبوم غير موجود.');
    return this.repo.removeAlbum(id);
  }

  async listImages(albumId) {
    return this.repo.listItems(albumId);
  }

  async addImage(albumId, data) {
    const album = await this.repo.findAlbumById(albumId);
    if (!album) throw AppError.notFound('الألبوم غير موجود.');
    const sortOrder = data.sort_order ?? (await this.repo.nextItemSort(albumId));
    const title = data.title?.trim() ? data.title.trim() : album.title;
    return this.repo.createItem({ ...data, title, album_id: albumId, sort_order: sortOrder });
  }

  async getImage(id) {
    const image = await this.repo.findItemById(id);
    if (!image) throw AppError.notFound('الصورة غير موجودة.');
    return image;
  }

  async updateImage(id, data) {
    const image = await this.repo.findItemById(id);
    if (!image) throw AppError.notFound('الصورة غير موجودة.');
    if (data.album_id) {
      const album = await this.repo.findAlbumById(data.album_id);
      if (!album) throw AppError.badRequest('الألبوم المحدد غير موجود.');
    }
    return this.repo.updateItem(id, data);
  }

  async removeImage(id) {
    const image = await this.repo.findItemById(id);
    if (!image) throw AppError.notFound('الصورة غير موجودة.');
    return this.repo.removeItem(id);
  }
}
