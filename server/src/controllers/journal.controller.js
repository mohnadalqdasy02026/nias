import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { JournalService } from '../services/journal.service.js';

export class JournalController {
  constructor(service = new JournalService()) {
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
