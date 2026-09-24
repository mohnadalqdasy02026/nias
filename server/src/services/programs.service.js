import { AppError } from '../utils/AppError.js';

export class ProgramService {
  constructor(repository) {
    this.repository = repository;
  }

  async list(filters) {
    return this.repository.list(filters);
  }

  async getById(id) {
    const program = await this.repository.findById(id);
    if (!program) throw AppError.notFound('Program not found');
    return program;
  }

  async create(data) {
    await this.assertReferences(data.college_id, data.department_id, data.branch_id);
    return this.repository.create(data);
  }

  async update(id, data) {
    await this.assertReferences(data.college_id, data.department_id, data.branch_id);
    const program = await this.repository.update(id, data);
    if (!program) throw AppError.notFound('Program not found');
    return program;
  }

  async assertReferences(college_id, department_id, branch_id) {
    if (branch_id != null && !(await this.repository.branchExists(branch_id))) {
      throw AppError.unprocessable('Branch does not exist', [
        { field: 'branch_id', message: 'Branch not found' },
      ]);
    }
    if (college_id == null && department_id == null) return;
    if (college_id == null && department_id != null) {
      throw AppError.unprocessable('A college reference is required', [
        { field: 'college_id', message: 'Select a college for this program' },
      ]);
    }
    if (college_id == null) return;
    const collegeOk = await this.repository.collegeExists(college_id);
    if (!collegeOk) {
      throw AppError.unprocessable('College does not exist', [
        { field: 'college_id', message: 'College not found' },
      ]);
    }
    if (department_id == null) return;
    const deptOk = await this.repository.departmentExists(department_id);
    if (!deptOk) {
      throw AppError.unprocessable('Department does not exist', [
        { field: 'department_id', message: 'Department not found' },
      ]);
    }
  }

  async remove(id) {
    const program = await this.repository.softDelete(id);
    if (!program) throw AppError.notFound('Program not found');
    return { deleted: true, id };
  }
}