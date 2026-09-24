import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AdminUserRepository } from '../repositories/users-admin.repository.js';
import { RolesRepository } from '../repositories/roles.repository.js';
import { AdminUsersService } from '../services/admin-users.service.js';
import { AdminRolesService } from '../services/admin-roles.service.js';
import { AdminUsersController } from '../controllers/admin-users.controller.js';
import {
  listUsersSchema,
  userIdParamsSchema,
  createUserSchema,
  updateUserSchema,
  createRoleSchema,
  updateRoleSchema,
  roleIdParamsSchema,
  rolePermissionsSchema,
} from '../validators/admin-users.validators.js';

const controller = new AdminUsersController(
  new AdminUsersService(new AdminUserRepository(), new RolesRepository()),
  new AdminRolesService(new RolesRepository()),
);

const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get('/', validate(listUsersSchema), requirePermission('users.view'), controller.listUsers);
usersRouter.post('/', validate(createUserSchema), requirePermission('users.manage'), controller.createUser);
usersRouter.get('/:id', validate(userIdParamsSchema), requirePermission('users.view'), controller.getUser);
usersRouter.patch('/:id', validate(updateUserSchema), requirePermission('users.manage'), controller.updateUser);
usersRouter.delete('/:id', validate(userIdParamsSchema), requirePermission('users.manage'), controller.removeUser);

const rolesRouter = Router();
rolesRouter.use(requireAuth);

rolesRouter.get('/all', requirePermission('roles.manage'), controller.listRoles);
rolesRouter.get('/permissions', requirePermission('roles.manage'), controller.listPermissions);
rolesRouter.get('/:id', validate(roleIdParamsSchema), requirePermission('roles.manage'), controller.getRolePermissions);
rolesRouter.post('/', validate(createRoleSchema), requirePermission('roles.manage'), controller.createRole);
rolesRouter.patch('/:id', validate(updateRoleSchema), requirePermission('roles.manage'), controller.updateRole);
rolesRouter.put('/:id/permissions', validate(rolePermissionsSchema), requirePermission('roles.manage'), controller.upsertRolePermissions);
rolesRouter.delete('/:id', validate(roleIdParamsSchema), requirePermission('roles.manage'), controller.removeRole);

export const adminUsersRouter = usersRouter;
export const adminRolesRouter = rolesRouter;