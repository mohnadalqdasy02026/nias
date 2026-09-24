import { asyncHandler, success } from '../utils/asyncHandler.js';

export class AdminUsersController {
  constructor(usersService, rolesService) {
    this.usersService = usersService;
    this.rolesService = rolesService;
  }

  listUsers = asyncHandler(async (req, res) => success(res, await this.usersService.list(req.query)));
  getUser = asyncHandler(async (req, res) => success(res, await this.usersService.getById(req.params.id)));
  createUser = asyncHandler(async (req, res) => success(res, await this.usersService.create(req.body), 201));
  updateUser = asyncHandler(async (req, res) => success(res, await this.usersService.update(req.params.id, req.body, req.user.id)));
  removeUser = asyncHandler(async (req, res) => success(res, await this.usersService.remove(req.params.id, req.user.id)));

  listRoles = asyncHandler(async (_req, res) => success(res, await this.rolesService.list()));
  listPermissions = asyncHandler(async (_req, res) => success(res, await this.rolesService.permissions()));
  getRolePermissions = asyncHandler(async (req, res) => success(res, await this.rolesService.getRolePermissions(req.params.id)));
  createRole = asyncHandler(async (req, res) => success(res, await this.rolesService.create(req.body), 201));
  updateRole = asyncHandler(async (req, res) => success(res, await this.rolesService.update(req.params.id, req.body)));
  upsertRolePermissions = asyncHandler(async (req, res) =>
    success(res, await this.rolesService.upsertPermissions(req.params.id, req.body.permissions, req.user.id)),
  );
  removeRole = asyncHandler(async (req, res) => success(res, await this.rolesService.remove(req.params.id)));
}