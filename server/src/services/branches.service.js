import { BranchesRepository } from '../repositories/branches.repository.js';
import { AppError } from '../utils/AppError.js';

export class BranchesService {
  constructor(repo = new BranchesRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async get(id) {
    const branch = await this.repo.findById(id);
    if (!branch) {
      throw AppError.notFound('الفرع غير موجود.');
    }
    return branch;
  }

  async update(id, data) {
    const branch = await this.repo.findById(id);
    if (!branch) {
      throw AppError.notFound('الفرع غير موجود.');
    }
    return this.repo.update(id, data);
  }
}