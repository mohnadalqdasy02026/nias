import { Router } from 'express';
import statusRoutes from './status.routes.js';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';
import contentRoutes from './content.routes.js';
import trainingRoutes from './training.routes.js';
import mediaRoutes from './media.routes.js';
import programsRoutes from './programs.routes.js';
import branchesRoutes from './branches.routes.js';
import { adminUsersRouter, adminRolesRouter } from './admin-users.routes.js';

const router = Router();

router.use('/status', statusRoutes);
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/content', contentRoutes);
router.use('/admin/training', trainingRoutes);
router.use('/admin/media', mediaRoutes);
router.use('/admin/programs', programsRoutes);
router.use('/admin/users', adminUsersRouter);
router.use('/admin/roles', adminRolesRouter);
router.use('/admin/branches', branchesRoutes);
router.get('/', (_req, res) => {
  res.json({ success: true, data: { service: 'nias-api', version: 'v1', docs: '/api/v1/public/stats' } });
});

export default router;