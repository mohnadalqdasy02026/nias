import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { BranchesController } from '../controllers/branches.controller.js';
import { branchIdParamsSchema, updateBranchSchema } from '../validators/branches.validators.js';

const router = Router();
const branchesController = new BranchesController();

router.use(requireAuth);

router.get('/', requirePermission('branches.read'), branchesController.list);
router.patch(
  '/:id',
  validate(branchIdParamsSchema),
  requirePermission('branches.manage'),
  branchesController.update,
);

export default router;