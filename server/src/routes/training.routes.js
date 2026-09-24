import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { TrainingController } from '../controllers/training.controller.js';
import {
  listTrainingCoursesSchema,
  createCourseSchema,
  updateCourseSchema,
  getCourseParams,
  listEnrollmentsSchema,
  updateEnrollmentStatusSchema,
  listTraineesSchema,
} from '../validators/training.validators.js';

const router = Router();
const training = new TrainingController();

router.use(requireAuth);

// Courses
router.get('/courses', validate(listTrainingCoursesSchema), requirePermission('training_courses.read'), training.listCourses);
router.get('/courses/:id', validate(getCourseParams), requirePermission('training_courses.read'), training.getCourse);
router.post('/courses', validate(createCourseSchema), requirePermission('training_courses.create'), training.createCourse);
router.patch('/courses/:id', validate(updateCourseSchema), requirePermission('training_courses.update'), training.updateCourse);
router.delete('/courses/:id', validate(getCourseParams), requirePermission('training_courses.delete'), training.deleteCourse);

// Trainees
router.get('/trainees', validate(listTraineesSchema), requirePermission('training_users.read'), training.listTrainees);

// Enrollments
router.get('/enrollments', validate(listEnrollmentsSchema), requirePermission('training_enrollments.read'), training.listEnrollments);
router.get('/enrollments/:id', validate(getCourseParams), requirePermission('training_enrollments.read'), training.getEnrollment);
router.patch('/enrollments/:id/status', validate(updateEnrollmentStatusSchema), requirePermission('training_enrollments.review'), training.updateEnrollmentStatus);

export default router;