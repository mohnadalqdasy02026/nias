import { AppError } from '../utils/AppError.js';

export class FacultyService {
  constructor(repository) {
    this.repository = repository;
  }

  async list(filters) {
    return this.repository.list(filters);
  }

  async listTitles(filters) {
    return this.repository.listTitles(filters);
  }

  async getById(id) {
    const member = await this.repository.findById(id);
    if (!member) throw AppError.notFound('Faculty member not found');
    return member;
  }

  async create(data) {
    await this.assertReferences(data.department_id, data.branch_id);
    return this.repository.create(data);
  }

  async update(id, data) {
    await this.assertReferences(data.department_id, data.branch_id);
    const member = await this.repository.update(id, data);
    if (!member) throw AppError.notFound('Faculty member not found');
    return member;
  }

  async assertReferences(department_id, branch_id) {
    if (branch_id != null && !(await this.repository.branchExists(branch_id))) {
      throw AppError.unprocessable('Branch does not exist', [
        { field: 'branch_id', message: 'Branch not found' },
      ]);
    }
    if (department_id == null) return;
    if (!(await this.repository.departmentExists(department_id))) {
      throw AppError.unprocessable('Department does not exist', [
        { field: 'department_id', message: 'Department not found' },
      ]);
    }
  }

  async remove(id) {
    const member = await this.repository.softDelete(id);
    if (!member) throw AppError.notFound('Faculty member not found');
    return { deleted: true, id };
  }
}