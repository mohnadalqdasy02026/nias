import { SettingsService } from '../services/settings.service.js';

export class SettingsController {
  constructor(service = new SettingsService()) {
    this.service = service;
  }

  getPublic = async (_req, res, next) => {
    try {
      res.json({ data: await this.service.getPublicSettings() });
    } catch (e) {
      next(e);
    }
  };

  getGroup = async (req, res, next) => {
    try {
      res.json({ data: await this.service.getGroup(req.params.group) });
    } catch (e) {
      next(e);
    }
  };

  updateGroup = async (req, res, next) => {
    try {
      const updated = await this.service.updateGroup(req.params.group, req.body);
      res.json({ data: updated });
    } catch (e) {
      next(e);
    }
  };
}