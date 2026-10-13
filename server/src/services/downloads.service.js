import { DownloadsRepository } from '../repositories/downloads.repository.js';
import { AppError } from '../utils/AppError.js';

export class DownloadsService {
  constructor(repo = new DownloadsRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async get(id) {
    const item = await this.repo.findById(id);
    if (!item) throw AppError.notFound('الملف غير موجود.');
    return item;
  }

  async create(data) {
    return this.repo.create(data);
  }

  async update(id, data) {
    const item = await this.repo.findById(id);
    if (!item) throw AppError.notFound('الملف غير موجود.');
    return this.repo.update(id, data);
  }

  async remove(id) {
    const item = await this.repo.findById(id);
    if (!item) throw AppError.notFound('الملف غير موجود.');
    return this.repo.remove(id);
  }
}
