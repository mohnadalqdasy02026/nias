import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { DownloadsService } from '../services/downloads.service.js';

export class DownloadsController {
  constructor(service = new DownloadsService()) {
    this.service = service;
  }

  list = asyncHandler(async (_req, res) => success(res, await this.service.list()));

  get = asyncHandler(async (req, res) =>
    success(res, await this.service.get(Number(req.params.id))));

  create = asyncHandler(async (req, res) =>
    created(res, await this.service.create(req.body)));

  update = asyncHandler(async (req, res) =>
    success(res, await this.service.update(Number(req.params.id), req.body)));

  remove = asyncHandler(async (req, res) => {
    await this.service.remove(Number(req.params.id));
    return success(res, { deleted: true });
  });
}
