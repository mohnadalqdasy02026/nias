import { asyncHandler } from '../utils/asyncHandler.js';

export class MediaController {
  constructor(service) {
    this.service = service;
  }

  list = asyncHandler(async (req, res) => {
    const data = await this.service.list(req.query);
    res.json({ success: true, data });
  });

  upload = asyncHandler(async (req, res) => {
    const data = await this.service.upload(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  });

  update = asyncHandler(async (req, res) => {
    const data = await this.service.update(req.params.id, req.body);
    res.json({ success: true, data });
  });

  remove = asyncHandler(async (req, res) => {
    const data = await this.service.remove(req.params.id);
    res.json({ success: true, data });
  });
}