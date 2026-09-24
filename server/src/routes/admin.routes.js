import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AdminController } from '../controllers/admin.controller.js';
import {
  listContactMessagesSchema,
  getContactMessageParams,
  updateContactMessageStatusSchema,
} from '../validators/admin.validators.js';

const router = Router();
const adminController = new AdminController();

// All routes require a valid session
router.use(requireAuth);

// Dashboard
router.get('/stats', requirePermission('dashboard.access'), adminController.stats);

// Contact messages
router.get(
  '/contact-messages',
  validate(listContactMessagesSchema),
  requirePermission('contact_messages.read'),
  adminController.listContactMessages,
);
router.get(
  '/contact-messages/:id',
  validate(getContactMessageParams),
  requirePermission('contact_messages.read'),
  adminController.getContactMessage,
);
router.patch(
  '/contact-messages/:id',
  validate(updateContactMessageStatusSchema),
  requirePermission('contact_messages.update'),
  adminController.updateContactMessageStatus,
);
router.delete(
  '/contact-messages/:id',
  validate(getContactMessageParams),
  requirePermission('contact_messages.delete'),
  adminController.deleteContactMessage,
);

export default router;