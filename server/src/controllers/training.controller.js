import { asyncHandler, success, created } from '../utils/asyncHandler.js';
import { TrainingService } from '../services/training.service.js';

export class TrainingController {
  constructor(service = new TrainingService()) {
    this.service = service;
  }

  // admin courses
  listCourses = asyncHandler(async (req, res) => success(res, await this.service.listCourses(req.query)));
  getCourse = asyncHandler(async (req, res) => success(res, await this.service.getCourse(req.params.id)));
  createCourse = asyncHandler(async (req, res) => created(res, await this.service.createCourse(this.withDefaultBranch(req))));
  updateCourse = asyncHandler(async (req, res) => success(res, await this.service.updateCourse(req.params.id, this.withDefaultBranch(req))));
  deleteCourse = asyncHandler(async (req, res) => success(res, await this.service.deleteCourse(req.params.id)));

  // trainees
  listTrainees = asyncHandler(async (req, res) => success(res, await this.service.listTrainees(req.query)));

  // enrollments
  listEnrollments = asyncHandler(async (req, res) => success(res, await this.service.listEnrollments(req.query)));
  getEnrollment = asyncHandler(async (req, res) => success(res, await this.service.getEnrollment(req.params.id)));
  updateEnrollmentStatus = asyncHandler(async (req, res) =>
    success(res, await this.service.updateEnrollmentStatus(req.params.id, req.body.status)),
  );

  // public registration
  captcha = asyncHandler(async (_req, res) => success(res, this.service.buildCaptcha()));
  register = asyncHandler(async (req, res) => created(res, await this.service.registerForCourse(req.body)));

  // Default a course to the actor's branch when none is sent.
  withDefaultBranch(req) {
    const body = { ...req.body };
    if (body.branch_id == null) body.branch_id = req.user?.branchId ?? null;
    return body;
  }
}