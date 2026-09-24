import { CollegesRepository } from '../repositories/colleges.repository.js';

export class CollegesService {
  constructor(repo = new CollegesRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async update(id, data) {
    const college = await this.repo.findById(id);
    if (!college) {
      const error = new Error('الكلية غير موجودة.');
      error.status = 404;
      throw error;
    }
    return this.repo.update(id, data);
  }
}