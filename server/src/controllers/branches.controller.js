import { BranchesService } from '../services/branches.service.js';

export class BranchesController {
  constructor(service = new BranchesService()) {
    this.service = service;
  }

  list = async (_req, res, next) => {
    try {
      res.json({ data: await this.service.list() });
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await this.service.update(id, req.body);
      res.json({ data: updated });
    } catch (e) {
      next(e);
    }
  };
}