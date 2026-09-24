import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ProgramRepository } from '../repositories/programs.repository.js';
import { ProgramService } from '../services/programs.service.js';
import { ProgramController } from '../controllers/programs.controller.js';
import { pool } from '../config/db.js';
import {
  listProgramsSchema,
  programParamsSchema,
  createProgramSchema,
  updateProgramSchema,
} from '../validators/programs.validators.js';

const router = Router();
const programController = new ProgramController(new ProgramService(new ProgramRepository()));

router.use(requireAuth);

router.get(
  '/',
  validate(listProgramsSchema),
  requirePermission('academic_programs.read'),
  programController.list,
);

router.get(
  '/lookup',
  requirePermission('academic_programs.read'),
  asyncHandler(async (_req, res) => {
    const { rows: colleges } = await pool.query(
      'SELECT id, name_ar, name_en, status FROM colleges ORDER BY id',
    );
    const { rows: departments } = await pool.query(
      'SELECT id, college_id, name_ar, name_en FROM departments ORDER BY id',
    );
    const { rows: branches } = await pool.query(
      "SELECT id, name_ar, name_en, is_headquarters FROM institute_branches WHERE status = 'active' ORDER BY is_headquarters DESC, id",
    );
    res.json({ success: true, data: { colleges, departments, branches } });
  }),
);

router.get(
  '/:id',
  validate(programParamsSchema),
  requirePermission('academic_programs.read'),
  programController.getById,
);

router.post(
  '/',
  validate(createProgramSchema),
  requirePermission('academic_programs.create'),
  programController.create,
);

router.patch(
  '/:id',
  validate(updateProgramSchema),
  requirePermission('academic_programs.update'),
  programController.update,
);

router.delete(
  '/:id',
  validate(programParamsSchema),
  requirePermission('academic_programs.delete'),
  programController.remove,
);

export default router;