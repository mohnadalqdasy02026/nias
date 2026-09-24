import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { ContentService } from '../services/content.service.js';

export class ContentController {
  constructor(service = new ContentService()) {
    this.service = service;
  }

  // News
  listNews = asyncHandler(async (req, res) => success(res, await this.service.listNews(req.query)));
  getNews = asyncHandler(async (req, res) => success(res, await this.service.getNews(req.params.id)));
  createNews = asyncHandler(async (req, res) => created(res, await this.service.createNews(this.withDefaultBranch(req))));
  updateNews = asyncHandler(async (req, res) => success(res, await this.service.updateNews(req.params.id, this.withDefaultBranch(req))));
  deleteNews = asyncHandler(async (req, res) => success(res, await this.service.deleteNews(req.params.id)));

  // Categories
  listCategories = asyncHandler(async (_req, res) => success(res, await this.service.listCategories()));
  createCategory = asyncHandler(async (req, res) => created(res, await this.service.createCategory(req.body)));
  updateCategory = asyncHandler(async (req, res) => success(res, await this.service.updateCategory(req.params.id, req.body)));
  deleteCategory = asyncHandler(async (req, res) => success(res, await this.service.deleteCategory(req.params.id)));

  // Pages
  listPages = asyncHandler(async (_req, res) => success(res, await this.service.listPages()));
  getPage = asyncHandler(async (req, res) => success(res, await this.service.getPage(req.params.id)));
  createPage = asyncHandler(async (req, res) => created(res, await this.service.createPage(req.body)));
  updatePage = asyncHandler(async (req, res) => success(res, await this.service.updatePage(req.params.id, req.body)));
  deletePage = asyncHandler(async (req, res) => success(res, await this.service.deletePage(req.params.id)));

  // Default a news item to the actor's branch when none is sent.
  withDefaultBranch(req) {
    const body = { ...req.body };
    if (body.branch_id == null) body.branch_id = req.user?.branchId ?? null;
    return body;
  }
}