import { AppError } from '../utils/AppError.js';
import { NewsRepository, NewsCategoryRepository } from '../repositories/news.repository.js';
import { PageRepository } from '../repositories/page.repository.js';
import { pool } from '../config/db.js';

export class ContentService {
  constructor(newsRepo = new NewsRepository(), categoryRepo = new NewsCategoryRepository(), pageRepo = new PageRepository()) {
    this.newsRepo = newsRepo;
    this.categoryRepo = categoryRepo;
    this.pageRepo = pageRepo;
  }

  // ---------- News ----------
  async listNews(query) {
    return this.newsRepo.list(query);
  }

  async getNews(id) {
    const news = await this.newsRepo.get(id);
    if (!news) throw AppError.notFound('News item not found');
    return news;
  }

  async createNews(data) {
    await this.ensureCategory(data.category_id);
    if (data.branch_id != null) await this.ensureBranch(data.branch_id);
    return this.newsRepo.create(data);
  }

  async updateNews(id, data) {
    if (data.category_id !== undefined) await this.ensureCategory(data.category_id);
    if (data.branch_id !== undefined && data.branch_id != null) await this.ensureBranch(data.branch_id);
    await this.getNews(id);
    return this.newsRepo.update(id, data);
  }

  async deleteNews(id) {
    const deleted = await this.newsRepo.delete(id);
    if (!deleted) throw AppError.notFound('News item not found');
    return { id: Number(id), deleted: true };
  }

  // ---------- Categories ----------
  async listCategories() {
    return this.categoryRepo.list();
  }

  async createCategory({ name_ar, name_en, slug }) {
    if (await this.categoryRepo.findBySlug(slug)) {
      throw AppError.conflict('Category slug already exists');
    }
    return this.categoryRepo.create({ nameAr: name_ar, nameEn: name_en, slug });
  }

  async updateCategory(id, { name_ar, name_en, slug }) {
    if (slug) {
      const existing = await this.categoryRepo.findBySlug(slug);
      if (existing && String(existing.id) !== String(id)) {
        throw AppError.conflict('Category slug already exists');
      }
    }
    await this.getCategory(id);
    return this.categoryRepo.update(id, { nameAr: name_ar, nameEn: name_en, slug });
  }

  async getCategory(id) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw AppError.notFound('Category not found');
    return category;
  }

  async deleteCategory(id) {
    await this.getCategory(id);
    const deleted = await this.categoryRepo.delete(id);
    if (!deleted) throw AppError.notFound('Category not found');
    return { id: Number(id), deleted: true };
  }

  // ---------- Static pages ----------
  async listPages() {
    return this.pageRepo.list();
  }

  async getPage(id) {
    const page = await this.pageRepo.get(id);
    if (!page) throw AppError.notFound('Page not found');
    return page;
  }

  async createPage(data) {
    if (await this.pageRepo.findBySlug(data.slug)) {
      throw AppError.conflict('Page slug already exists');
    }
    return this.pageRepo.create(data);
  }

  async updatePage(id, data) {
    if (data.slug !== undefined && data.slug !== null) {
      const existing = await this.pageRepo.findBySlug(data.slug);
      if (existing && String(existing.id) !== String(id)) {
        throw AppError.conflict('Page slug already exists');
      }
    }
    await this.getPage(id);
    return this.pageRepo.update(id, data);
  }

  async deletePage(id) {
    await this.getPage(id);
    const deleted = await this.pageRepo.delete(id);
    if (!deleted) throw AppError.notFound('Page not found');
    return { id: Number(id), deleted: true };
  }

  // ---------- helpers ----------
  async ensureCategory(categoryId) {
    if (categoryId == null) return;
    if (!(await this.categoryRepo.findById(categoryId))) {
      throw AppError.badRequest('Category does not exist');
    }
  }

  async ensureBranch(branchId) {
    const { rows } = await pool.query('SELECT id FROM institute_branches WHERE id = $1', [branchId]);
    if (rows.length === 0) throw AppError.badRequest('Branch does not exist');
  }
}