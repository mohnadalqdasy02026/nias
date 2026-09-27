import { CollegesService } from '../services/colleges.service.js';

export class CollegesController {
  constructor(service = new CollegesService()) {
    this.service = service;
  }

  list = async (_req, res, next) => {
    try {
      res.json({ data: await this.service.list() });
    } catch (e) {
      next(e);
    }
  };

  get = async (req, res, next) => {
    try {
      res.json({ data: await this.service.get(Number(req.params.id)) });
    } catch (e) {
      next(e);
    }
  };

  create = async (req, res, next) => {
    try {
      res.status(201).json({ data: await this.service.create(req.body) });
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

  remove = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await this.service.remove(id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  };
}