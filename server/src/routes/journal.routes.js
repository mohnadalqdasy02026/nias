import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { JournalController } from '../controllers/journal.controller.js';
import {
  journalIdParamsSchema,
  createJournalIssueSchema,
  updateJournalIssueSchema,
} from '../validators/journal.validators.js';

const router = Router();
const journalController = new JournalController();

router.use(requireAuth);

router.get('/', requirePermission('journal.read'), journalController.list);
router.post(
  '/',
  validate(createJournalIssueSchema),
  requirePermission('journal.create'),
  journalController.create,
);
router.get('/:id', validate(journalIdParamsSchema), requirePermission('journal.read'), journalController.get);
router.patch(
  '/:id',
  validate(journalIdParamsSchema),
  validate(updateJournalIssueSchema),
  requirePermission('journal.update'),
  journalController.update,
);
router.delete(
  '/:id',
  validate(journalIdParamsSchema),
  requirePermission('journal.delete'),
  journalController.remove,
);

export default router;
