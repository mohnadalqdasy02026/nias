import { asyncHandler, success } from '../utils/asyncHandler.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  constructor(service = new AdminService()) {
    this.service = service;
  }

  stats = asyncHandler(async (_req, res) => success(res, await this.service.getStats()));
  listContactMessages = asyncHandler(async (req, res) =>
    success(res, await this.service.listContactMessages(req.query)),
  );
  getContactMessage = asyncHandler(async (req, res) =>
    success(res, await this.service.getContactMessage(req.params.id)),
  );
  updateContactMessageStatus = asyncHandler(async (req, res) =>
    success(res, await this.service.updateContactMessageStatus(req.params.id, req.body.status)),
  );
  deleteContactMessage = asyncHandler(async (req, res) =>
    success(res, await this.service.deleteContactMessage(req.params.id)),
  );
}