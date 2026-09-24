import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, passwordLimiter } from '../middleware/rateLimit.js';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
  requestResetSchema,
  resetPasswordSchema,
} from '../validators/auth.validators.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);
router.post('/logout', validate(logoutSchema), authController.logout);
router.post('/forgot-password', passwordLimiter, validate(requestResetSchema), authController.forgotPassword);
router.post('/reset-password', passwordLimiter, validate(resetPasswordSchema), authController.resetPassword);

router.get('/me', requireAuth, authController.me);
router.post('/logout-all', requireAuth, authController.logoutAll);

export default router;