import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { PublicService } from '../services/public.service.js';
import { ContactService } from '../services/contact.service.js';

export class PublicController {
  constructor(
    publicService = new PublicService(),
    contactService = new ContactService(),
  ) {
    this.publicService = publicService;
    this.contactService = contactService;
  }

  listNews = asyncHandler(async (req, res) => success(res, await this.publicService.listNews(req.query)));
  getNews = asyncHandler(async (req, res) => success(res, await this.publicService.getNews(req.params.id)));
  listCategories = asyncHandler(async (_req, res) => success(res, await this.publicService.listCategories()));
  listPrograms = asyncHandler(async (req, res) => success(res, await this.publicService.listPrograms(req.query)));
  getProgram = asyncHandler(async (req, res) => success(res, await this.publicService.getProgram(req.params.id)));
  listColleges = asyncHandler(async (_req, res) => success(res, await this.publicService.listColleges()));
  listDepartments = asyncHandler(async (req, res) => success(res, await this.publicService.listDepartments(req.query.collegeId)));
  listFaculty = asyncHandler(async (req, res) => success(res, await this.publicService.listFaculty(req.query.branchId)));
  listBranches = asyncHandler(async (_req, res) => success(res, await this.publicService.listBranches()));
  getBranch = asyncHandler(async (req, res) => success(res, await this.publicService.getBranch(req.params.slug)));
  listGallery = asyncHandler(async (_req, res) => success(res, await this.publicService.listGallery()));
  listDownloads = asyncHandler(async (_req, res) => success(res, await this.publicService.listDownloads()));
  listConferences = asyncHandler(async (_req, res) => success(res, await this.publicService.listConferences()));
  listTrustees = asyncHandler(async (_req, res) => success(res, await this.publicService.listTrustees()));
  listJournalIssues = asyncHandler(async (_req, res) => success(res, await this.publicService.listJournalIssues()));
  listJournalArticles = asyncHandler(async (req, res) => success(res, await this.publicService.listJournalArticles(req.query.issueId)));
  listTrainingCourses = asyncHandler(async (req, res) => success(res, await this.publicService.listTrainingCourses(req.query)));
  listPages = asyncHandler(async (_req, res) => success(res, await this.publicService.listPages()));
  getPage = asyncHandler(async (req, res) => success(res, await this.publicService.getPage(req.params.slug)));
  search = asyncHandler(async (req, res) => success(res, await this.publicService.search(req.query.q)));
  stats = asyncHandler(async (_req, res) => success(res, await this.publicService.stats()));

  submitContact = asyncHandler(async (req, res) => created(res, await this.contactService.submit(req.body)));
}