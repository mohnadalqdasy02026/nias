import { CollegesRepository } from '../repositories/colleges.repository.js';
import { AppError } from '../utils/AppError.js';

export class CollegesService {
  constructor(repo = new CollegesRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async get(id) {
    const college = await this.repo.findById(id);
    if (!college) throw AppError.notFound('الكلية غير موجودة.');
    return college;
  }

  async create(data) {
    if (data.branch_id && !(await this.repo.branchExists(data.branch_id))) {
      throw AppError.badRequest('الفرع المحدد غير موجود.');
    }
    return this.repo.create(data);
  }

  async update(id, data) {
    const college = await this.repo.findById(id);
    if (!college) throw AppError.notFound('الكلية غير موجودة.');
    if (data.branch_id && !(await this.repo.branchExists(data.branch_id))) {
      throw AppError.badRequest('الفرع المحدد غير موجود.');
    }
    return this.repo.update(id, data);
  }

  async remove(id) {
    const college = await this.repo.findById(id);
    if (!college) throw AppError.notFound('الكلية غير موجودة.');
    return this.repo.remove(id);
  }
}