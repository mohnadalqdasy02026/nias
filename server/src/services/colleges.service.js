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

  async listDepartments(collegeId) {
    return this.repo.listDepartments(collegeId ?? null);
  }

  async getDepartment(id) {
    const department = await this.repo.findDepartmentById(id);
    if (!department) throw AppError.notFound('القسم غير موجود.');
    return department;
  }

  async createDepartment(data) {
    if (!(await this.repo.findById(data.college_id))) {
      throw AppError.badRequest('الكلية المحددة غير موجودة.');
    }
    return this.repo.createDepartment(data);
  }

  async updateDepartment(id, data) {
    const department = await this.repo.findDepartmentById(id);
    if (!department) throw AppError.notFound('القسم غير موجود.');
    if (data.college_id && !(await this.repo.findById(data.college_id))) {
      throw AppError.badRequest('الكلية المحددة غير موجودة.');
    }
    return this.repo.updateDepartment(id, data);
  }

  async removeDepartment(id) {
    const department = await this.repo.findDepartmentById(id);
    if (!department) throw AppError.notFound('القسم غير موجود.');
    const usage = await this.repo.departmentUsage(id);
    if (usage.programs_count > 0 || usage.faculty_count > 0) {
      throw AppError.badRequest(
        `لا يمكن حذف القسم لأنه مرتبط بـ ${usage.programs_count} برنامجاً و ${usage.faculty_count} عضو هيئة تدريس.`,
      );
    }
    return this.repo.removeDepartment(id);
  }
}