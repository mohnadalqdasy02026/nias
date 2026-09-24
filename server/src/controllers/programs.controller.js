import { asyncHandler, success } from '../utils/asyncHandler.js';

export class ProgramController {
  constructor(service) {
    this.service = service;
  }

  list = asyncHandler(async (req, res) => success(res, await this.service.list(req.query)));
  getById = asyncHandler(async (req, res) => success(res, await this.service.getById(req.params.id)));
  create = asyncHandler(async (req, res) => success(res, await this.service.create(req.body), 201));
  update = asyncHandler(async (req, res) => success(res, await this.service.update(req.params.id, req.body)));
  remove = asyncHandler(async (req, res) => success(res, await this.service.remove(req.params.id)));
}