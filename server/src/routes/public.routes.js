import { Router } from 'express';
import { PublicController } from '../controllers/public.controller.js';
import { TrainingController } from '../controllers/training.controller.js';
import { validate } from '../middleware/validate.js';
import {
  listNewsSchema,
  listTrainingCoursesSchema,
  listProgramsSchema,
  getNewsParams,
  getProgramParams,
  getCourseParams,
  getBranchParams,
  getPageParams,
  searchSchema,
  contactSchema,
} from '../validators/public.validators.js';
import { trainingRegisterSchema } from '../validators/training.validators.js';
import { publicLimiter } from '../middleware/rateLimit.js';
import { SettingsController } from '../controllers/settings.controller.js';

const router = Router();
const publicController = new PublicController();
const trainingController = new TrainingController();
const settingsController = new SettingsController();

// Content
router.get('/news', validate(listNewsSchema), publicController.listNews);
router.get('/news/categories', publicController.listCategories);
router.get('/news/:id', validate({ params: getNewsParams.params }), publicController.getNews);

router.get('/programs', validate(listProgramsSchema), publicController.listPrograms);
router.get('/programs/:id', validate(getProgramParams), publicController.getProgram);
router.get('/colleges', publicController.listColleges);
router.get('/departments', publicController.listDepartments);
router.get('/faculty', publicController.listFaculty);
router.get('/branches', publicController.listBranches);
router.get('/branches/:slug', validate(getBranchParams), publicController.getBranch);

router.get('/gallery', publicController.listGallery);
router.get('/downloads', publicController.listDownloads);
router.get('/conferences', publicController.listConferences);
router.get('/trustees', publicController.listTrustees);

router.get('/journal/issues', publicController.listJournalIssues);
router.get('/journal/articles', publicController.listJournalArticles);

router.get('/training-courses', validate(listTrainingCoursesSchema), publicController.listTrainingCourses);
router.get('/training-courses/:id', validate(getCourseParams), publicController.getTrainingCourse);

router.get('/pages', publicController.listPages);
router.get('/pages/:slug', validate(getPageParams), publicController.getPage);

// Discovery
router.get('/search', validate(searchSchema), publicController.search);
router.get('/stats', publicController.stats);

// Site settings (public: logo, colors, homepage content)
router.get('/settings', settingsController.getPublic);

// Contact
router.post('/contact', publicLimiter, validate(contactSchema), publicController.submitContact);

// Training registration
router.get('/training/register/config', trainingController.captcha);
router.post('/training/register', publicLimiter, validate(trainingRegisterSchema), trainingController.register);

export default router;