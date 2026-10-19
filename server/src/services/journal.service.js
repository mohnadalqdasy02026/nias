import { JournalRepository } from '../repositories/journal.repository.js';
import { AppError } from '../utils/AppError.js';

export class JournalService {
  constructor(repo = new JournalRepository()) {
    this.repo = repo;
  }

  async list() {
    return this.repo.list();
  }

  async get(id) {
    const issue = await this.repo.findById(id);
    if (!issue) throw AppError.notFound('إصدار المجلة غير موجود.');
    return issue;
  }

  async create(data) {
    return this.repo.create(data);
  }

  async update(id, data) {
    const issue = await this.repo.findById(id);
    if (!issue) throw AppError.notFound('إصدار المجلة غير موجود.');
    return this.repo.update(id, data);
  }

  async remove(id) {
    const issue = await this.repo.findById(id);
    if (!issue) throw AppError.notFound('إصدار المجلة غير موجود.');
    return this.repo.remove(id);
  }
}
