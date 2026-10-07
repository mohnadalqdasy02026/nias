import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CollegesController } from '../controllers/colleges.controller.js';
import {
  collegeIdParamsSchema,
  createCollegeSchema,
  updateCollegeSchema,
  departmentParamsSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../validators/colleges.validators.js';

const router = Router();
const collegesController = new CollegesController();

router.use(requireAuth);

router.get('/departments', requirePermission('colleges.read'), collegesController.listDepartments);
router.get(
  '/departments/:id',
  validate(departmentParamsSchema),
  requirePermission('colleges.read'),
  collegesController.getDepartment,
);
router.post(
  '/departments',
  validate(createDepartmentSchema),
  requirePermission('colleges.manage'),
  collegesController.createDepartment,
);
router.patch(
  '/departments/:id',
  validate(departmentParamsSchema),
  validate(updateDepartmentSchema),
  requirePermission('colleges.manage'),
  collegesController.updateDepartment,
);
router.delete(
  '/departments/:id',
  validate(departmentParamsSchema),
  requirePermission('colleges.manage'),
  collegesController.removeDepartment,
);

router.get('/', requirePermission('colleges.read'), collegesController.list);
router.get(
  '/:id',
  validate(collegeIdParamsSchema),
  requirePermission('colleges.read'),
  collegesController.get,
);
router.post('/', validate(createCollegeSchema), requirePermission('colleges.manage'), collegesController.create);
router.patch(
  '/:id',
  validate(collegeIdParamsSchema),
  validate(updateCollegeSchema),
  requirePermission('colleges.manage'),
  collegesController.update,
);
router.delete('/:id', validate(collegeIdParamsSchema), requirePermission('colleges.manage'), collegesController.remove);

export default router;