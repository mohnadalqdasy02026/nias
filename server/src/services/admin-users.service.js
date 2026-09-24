import { AppError } from '../utils/AppError.js';
import { hashPassword } from '../utils/password.js';

export class AdminUsersService {
  constructor(userRepo, rolesRepo) {
    this.userRepo = userRepo;
    this.rolesRepo = rolesRepo;
  }

  async list(filters) {
    return this.userRepo.list(filters);
  }

  async getById(id) {
    const user = await this.userRepo.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async create(data) {
    if (data.email) {
      const dupEmail = await this.userRepo.findByEmail(data.email);
      if (dupEmail) throw AppError.conflict('Email already in use');
    }
    if (data.phone) {
      const dupPhone = await this.userRepo.findByPhone(data.phone);
      if (dupPhone) throw AppError.conflict('Phone already in use');
    }
    if (data.branch_id != null) await this.assertBranchExists(data.branch_id);

    const roleIds = data.roles && data.roles.length > 0 ? await this.assertRolesExist(data.roles) : [];

    const passwordHash = await hashPassword(data.password);
    const userId = await this.userRepo.create({
      full_name_ar: data.full_name_ar,
      full_name_en: data.full_name_en,
      email: data.email,
      phone: data.phone,
      password_hash: passwordHash,
      profile_image: data.profile_image,
      status: data.status,
      branch_id: data.branch_id,
    });

    if (data.roles && data.roles.length > 0) {
      await this.userRepo.setRoles(userId, roleIds);
    }

    return this.getById(userId);
  }

  async update(id, data, actorId) {
    if (!(await this.userRepo.findById(id))) throw AppError.notFound('User not found');

    if (data.email) {
      const dup = await this.userRepo.findByEmail(data.email);
      if (dup && String(dup.id) !== String(id)) throw AppError.conflict('Email already in use');
    }
    if (data.phone) {
      const dup = await this.userRepo.findByPhone(data.phone);
      if (dup && String(dup.id) !== String(id)) throw AppError.conflict('Phone already in use');
    }

    const fields = {};
    if (data.full_name_ar !== undefined) fields.full_name_ar = data.full_name_ar;
    if (data.full_name_en !== undefined) fields.full_name_en = data.full_name_en;
    if (data.email !== undefined) fields.email = data.email;
    if (data.phone !== undefined) fields.phone = data.phone;
    if (data.branch_id !== undefined) {
      if (data.branch_id != null) await this.assertBranchExists(data.branch_id);
      fields.branch_id = data.branch_id;
    }
    if (data.status !== undefined) {
      this.assertNotSelf(id, actorId, 'You cannot change your own status');
      fields.status = data.status;
    }
    if (data.password) fields.password_hash = await hashPassword(data.password);

    let roleIds = null;
    if (data.roles) {
      if (String(id) === String(actorId) && !data.roles.includes('Administrator')) {
        const otherAdmins = await this.userRepo.countActiveAdministrators(actorId);
        if (otherAdmins <= 0) {
          throw AppError.badRequest('You cannot remove the last active Administrator role from yourself');
        }
      }
      roleIds = await this.assertRolesExist(data.roles);
    }

    if (Object.keys(fields).length > 0) await this.userRepo.update(id, fields);

    if (roleIds) await this.userRepo.setRoles(id, roleIds);

    return this.getById(id);
  }

  async assertRolesExist(names) {
    const uniq = [...new Set(names)];
    const { rows } = await this.userRepo.findRolesByNames(uniq);
    const found = new Set(rows.map((r) => r.name));
    const missing = uniq.filter((n) => !found.has(n));
    if (missing.length > 0) {
      throw AppError.unprocessable('Unknown role names', [
        { field: 'roles', message: `Roles not found: ${missing.join(', ')}` },
      ]);
    }
    return rows.map((r) => r.id);
  }

  async assertBranchExists(branchId) {
    if (!(await this.userRepo.findBranch(branchId))) {
      throw AppError.badRequest('Branch does not exist');
    }
  }

  async remove(id, actorId) {
    this.assertNotSelf(id, actorId, 'You cannot delete your own account');
    const user = await this.userRepo.findById(id);
    if (!user) throw AppError.notFound('User not found');
    if (user.roles_list.includes('Administrator')) {
      const otherAdmins = await this.userRepo.countActiveAdministrators(actorId);
      if (otherAdmins <= 0) {
        throw AppError.badRequest('You cannot delete the last active Administrator');
      }
    }
    const deleted = await this.userRepo.softDelete(id);
    if (!deleted) throw AppError.notFound('User not found');
    return { deleted: true, id };
  }

  assertNotSelf(id, actorId, message) {
    if (String(id) === String(actorId)) throw AppError.badRequest(message);
  }
}