import { BranchesRepository } from '../repositories/branches.repository.js';

export class BranchesService {
  constructor(repo = new BranchesRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async update(id, data) {
    const branch = await this.repo.findById(id);
    if (!branch) {
      const error = new Error('الفرع غير موجود.');
      error.status = 404;
      throw error;
    }
    return this.repo.update(id, data);
  }
}