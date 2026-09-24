import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { CollegesController } from '../controllers/colleges.controller.js';

const router = Router();
const collegesController = new CollegesController();

router.use(requireAuth);

router.get('/', requirePermission('colleges.read'), collegesController.list);
router.patch('/:id', requirePermission('colleges.manage'), collegesController.update);

export default router;