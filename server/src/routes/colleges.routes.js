import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CollegesController } from '../controllers/colleges.controller.js';
import {
  collegeIdParamsSchema,
  createCollegeSchema,
  updateCollegeSchema,
} from '../validators/colleges.validators.js';

const router = Router();
const collegesController = new CollegesController();

router.use(requireAuth);

router.get('/', requirePermission('colleges.read'), collegesController.list);
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