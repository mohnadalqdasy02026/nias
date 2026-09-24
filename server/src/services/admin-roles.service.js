import { AppError } from '../utils/AppError.js';

const PROTECTED_ROLES = ['Administrator'];

export class AdminRolesService {
  constructor(rolesRepo) {
    this.rolesRepo = rolesRepo;
  }

  async list() {
    return this.rolesRepo.list();
  }

  async permissions() {
    return this.rolesRepo.permissions();
  }

  async getRolePermissions(id) {
    if (!(await this.rolesRepo.findById(id))) throw AppError.notFound('Role not found');
    return this.rolesRepo.getRolePermissionCodes(id);
  }

  async create(data) {
    if (await this.rolesRepo.findByName(data.name)) {
      throw AppError.conflict('Role name already exists');
    }
    return this.rolesRepo.create(data);
  }

  async update(id, data) {
    const role = await this.rolesRepo.findById(id);
    if (!role) throw AppError.notFound('Role not found');
    if (PROTECTED_ROLES.includes(role.name)) {
      throw AppError.badRequest('This role is protected and cannot be renamed');
    }
    if (data.name) {
      const dup = await this.rolesRepo.findByName(data.name);
      if (dup && String(dup.id) !== String(id)) throw AppError.conflict('Role name already exists');
    }
    return this.rolesRepo.update(id, data);
  }

  async upsertPermissions(id, codes, actorId) {
    const role = await this.rolesRepo.findById(id);
    if (!role) throw AppError.notFound('Role not found');
    if (PROTECTED_ROLES.includes(role.name)) {
      throw AppError.badRequest('The Administrator role has fixed permissions and cannot be changed');
    }
    const uniq = [...new Set(codes)];
    const allCodes = await this.rolesRepo.permissionCodes();
    const known = new Set(allCodes);
    const missing = uniq.filter((c) => !known.has(c));
    if (missing.length > 0) {
      throw AppError.unprocessable('Unknown permission codes', [
        { field: 'permissions', message: `Permissions not found: ${missing.join(', ')}` },
      ]);
    }
    await this.rolesRepo.setRolePermissions(id, uniq);
    return this.rolesRepo.getRolePermissionCodes(id);
  }

  async remove(id) {
    const role = await this.rolesRepo.findById(id);
    if (!role) throw AppError.notFound('Role not found');
    if (PROTECTED_ROLES.includes(role.name)) {
      throw AppError.badRequest('This role is protected and cannot be deleted');
    }
    const members = await this.rolesRepo.countMembers(id);
    if (members > 0) {
      throw AppError.badRequest('Cannot delete a role that is assigned to users');
    }
    await this.rolesRepo.delete(id);
    return { deleted: true, id };
  }
}