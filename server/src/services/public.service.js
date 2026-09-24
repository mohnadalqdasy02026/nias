import { PublicRepository } from '../repositories/public.repository.js';
import { SearchRepository, StatsRepository } from '../repositories/search.repository.js';
import { AppError } from '../utils/AppError.js';

export class PublicService {
  constructor(
    publicRepo = new PublicRepository(),
    searchRepo = new SearchRepository(),
    statsRepo = new StatsRepository(),
  ) {
    this.publicRepo = publicRepo;
    this.searchRepo = searchRepo;
    this.statsRepo = statsRepo;
  }

  async listNews(filters) {
    return this.publicRepo.listNewsByPage(filters);
  }

  async getNews(id) {
    const news = await this.publicRepo.getNewsById(id);
    if (!news) throw AppError.notFound('News not found');
    return news;
  }

  async listCategories() {
    return this.publicRepo.listCategories();
  }

  async listPrograms(query) {
    return this.publicRepo.listPrograms({ onlyOpen: query.open === 'true' });
  }

  async getProgram(id) {
    const program = await this.publicRepo.getProgramById(id);
    if (!program) throw AppError.notFound('Program not found');
    return program;
  }

  async listColleges() {
    return this.publicRepo.listColleges();
  }

  async listDepartments(collegeId) {
    return this.publicRepo.listDepartments(collegeId ?? null);
  }

  async listFaculty(branchId) {
    return this.publicRepo.listFaculty(branchId ?? null);
  }

  async listBranches() {
    return this.publicRepo.listBranches();
  }

  async getBranch(slug) {
    const branch = await this.publicRepo.getBranchBySlug(slug);
    if (!branch) throw AppError.notFound('Branch not found');
    return branch;
  }

  async listGallery() {
    return this.publicRepo.listGallery();
  }

  async listDownloads() {
    return this.publicRepo.listDownloads();
  }

  async listConferences() {
    return this.publicRepo.listConferences();
  }

  async listTrustees() {
    return this.publicRepo.listTrustees();
  }

  async listJournalIssues() {
    return this.publicRepo.listJournalIssues();
  }

  async listJournalArticles(issueId) {
    return this.publicRepo.listJournalArticles(issueId ?? null);
  }

  async listTrainingCourses(query = {}) {
    return this.publicRepo.listTrainingCourses({ branchId: query.branchId ? Number(query.branchId) : null });
  }

  async listPages() {
    return this.publicRepo.listPages();
  }

  async getPage(slug) {
    const page = await this.publicRepo.getPageBySlug(slug);
    if (!page) throw AppError.notFound('Page not found');
    return page;
  }

  async search(q) {
    if (!q || q.trim().length < 2) throw AppError.badRequest('Search query must be at least 2 characters');
    return this.searchRepo.search({ q: q.trim() });
  }

  async stats() {
    return this.statsRepo.all();
  }
}