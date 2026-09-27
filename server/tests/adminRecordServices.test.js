import { describe, it, expect } from 'vitest';
import { CollegesService } from '../src/services/colleges.service.js';
import { BranchesService } from '../src/services/branches.service.js';
import { AdminRolesService } from '../src/services/admin-roles.service.js';
import { AppError } from '../src/utils/AppError.js';

const college = { id: 2, name_ar: 'كلية', branch_id: 1 };

function collegeRepo(stub = {}) {
  return {
    list: async () => [college],
    findById: async (id) => (id === 2 ? college : null),
    branchExists: async () => true,
    create: async (data) => ({ ...college, ...data }),
    update: async (id, data) => ({ ...college, ...data }),
    remove: async () => true,
    ...stub,
  };
}

describe('CollegesService.get', () => {
  it('returns the college for a valid id', async () => {
    const service = new CollegesService(collegeRepo());
    await expect(service.get(2)).resolves.toEqual(college);
  });

  it('throws NOT_FOUND for a missing college', async () => {
    const service = new CollegesService(collegeRepo());
    await expect(service.get(99)).rejects.toBeInstanceOf(AppError);
    await expect(service.get(99)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('BranchesService.get', () => {
  const branch = { id: 1, name_ar: 'صنعاء', dean_name_ar: 'د. عميد' };

  it('returns the branch with the admin edit fields', async () => {
    const service = new BranchesService({
      list: async () => [branch],
      findById: async (id) => (id === 1 ? branch : null),
      update: async (id, data) => ({ ...branch, ...data }),
    });
    await expect(service.get(1)).resolves.toMatchObject({ id: 1, dean_name_ar: 'د. عميد' });
  });

  it('throws NOT_FOUND for a missing branch', async () => {
    const service = new BranchesService({
      list: async () => [],
      findById: async () => null,
      update: async () => null,
    });
    await expect(service.get(42)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('AdminRolesService.getWithPermissions', () => {
  const role = { id: 2, name: 'News Editor', description: 'تحرير الأخبار' };

  it('merges the role with its permission codes', async () => {
    const service = new AdminRolesService({
      findById: async (id) => (id === 2 ? role : null),
      getRolePermissionCodes: async () => ['news.read', 'news.update'],
    });
    await expect(service.getWithPermissions(2)).resolves.toEqual({
      ...role,
      permissions: ['news.read', 'news.update'],
    });
  });

  it('throws NOT_FOUND for a missing role', async () => {
    const service = new AdminRolesService({
      findById: async () => null,
      getRolePermissionCodes: async () => [],
    });
    await expect(service.getWithPermissions(7)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
