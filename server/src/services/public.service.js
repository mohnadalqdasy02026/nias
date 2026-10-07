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
    const courses = await this.publicRepo.listCoursesByProgram(id);
    const totalHours = courses.reduce((sum, c) => sum + Number(c.credit_hours || 0), 0);
    const levels = [...new Set(courses.map((c) => c.level_no))].sort((a, b) => a - b);
    return {
      ...program,
      studyPlan: {
        levels,
        totalHours,
        courses,
      },
    };
  }

  async listColleges(branchId) {
    return this.publicRepo.listColleges(branchId ?? null);
  }

  async getCollege(id) {
    const college = await this.publicRepo.getCollegeById(id);
    if (!college) throw AppError.notFound('College not found');
    return college;
  }

  async listDepartments(collegeId) {
    return this.publicRepo.listDepartments(collegeId ?? null);
  }

  async getDepartment(id) {
    const department = await this.publicRepo.getDepartmentById(id);
    if (!department) throw AppError.notFound('Department not found');
    const programs = await this.publicRepo.listDepartmentPrograms(id);
    const faculty = await this.publicRepo.listDepartmentFaculty(id);
    const head = faculty.find((f) => f.is_dept_head) ?? null;
    return {
      ...department,
      programs,
      faculty,
      head:
        head ??
        (department.head_name_ar
          ? {
              name_ar: department.head_name_ar,
              title: department.head_title,
            }
          : null),
    };
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
    return this.publicRepo.listTrainingCourses({
      branchId: query.branchId ? Number(query.branchId) : null,
      category: query.category || null,
    });
  }

  async getTrainingCourse(id) {
    const course = await this.publicRepo.getTrainingCourse(id);
    if (!course) throw AppError.notFound('Course not found');
    return course;
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