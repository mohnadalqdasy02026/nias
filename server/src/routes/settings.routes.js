import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { SettingsController } from '../controllers/settings.controller.js';

const router = Router();
const settingsController = new SettingsController();

router.get('/', requireAuth, requirePermission('site_settings.read'), settingsController.getPublic);

router.get('/:group', requireAuth, requirePermission('site_settings.read'), settingsController.getGroup);
router.patch('/:group', requireAuth, requirePermission('site_settings.update'), settingsController.updateGroup);

export default router;