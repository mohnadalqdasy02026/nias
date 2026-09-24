import { asyncHandler, success } from '../utils/asyncHandler.js';
import { StatusService } from '../services/status.service.js';

export class StatusController {
  constructor(service = new StatusService()) {
    this.service = service;
  }

  getHealth = asyncHandler(async (_req, res) => {
    const data = await this.service.getHealth();
    return success(res, data);
  });

  getDbStatus = asyncHandler(async (_req, res) => {
    const data = await this.service.getDbStatus();
    return success(res, data);
  });
}