import { Router } from 'express';
import { StatusController } from '../controllers/status.controller.js';

const router = Router();
const statusController = new StatusController();

router.get('/health', statusController.getHealth);
router.get('/healthz', statusController.getHealth);
router.get('/db', statusController.getDbStatus);

export default router;