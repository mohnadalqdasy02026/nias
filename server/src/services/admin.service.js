import { AppError } from '../utils/AppError.js';
import { AdminRepository } from '../repositories/admin.repository.js';

export class AdminService {
  constructor(repo = new AdminRepository()) {
    this.repo = repo;
  }

  async getStats() {
    return this.repo.getDashboardStats();
  }

  async listContactMessages({ status, page = 1, limit = 20 }) {
    const offset = (Number(page) - 1) * Number(limit);
    const result = await this.repo.listContactMessages({ status, limit: Number(limit), offset });
    return { page: Number(page), limit: Number(limit), items: result.items, total: result.total };
  }

  async getContactMessage(id) {
    const message = await this.repo.getContactMessage(id);
    if (!message) throw AppError.notFound('Contact message not found');
    return message;
  }

  async updateContactMessageStatus(id, status) {
    const updated = await this.repo.updateContactMessageStatus(id, status);
    if (!updated) throw AppError.notFound('Contact message not found');
    return updated;
  }

  async deleteContactMessage(id) {
    const deleted = await this.repo.deleteContactMessage(id);
    if (!deleted) throw AppError.notFound('Contact message not found');
    return { id: Number(id), deleted: true };
  }
}