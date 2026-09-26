import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { FacultyRepository } from '../repositories/faculty.repository.js';
import { FacultyService } from '../services/faculty.service.js';
import { FacultyController } from '../controllers/faculty.controller.js';
import { pool } from '../config/db.js';
import {
  listFacultySchema,
  facultyParamsSchema,
  createFacultySchema,
  updateFacultySchema,
} from '../validators/faculty.validators.js';

const router = Router();
const facultyController = new FacultyController(new FacultyService(new FacultyRepository()));

router.use(requireAuth);

router.get(
  '/',
  validate(listFacultySchema),
  requirePermission('faculty_members.read'),
  facultyController.list,
);

router.get(
  '/titles',
  requirePermission('faculty_members.read'),
  asyncHandler(async (req, res) => {
    const branchId = req.query.branchId ? Number(req.query.branchId) : null;
    const titles = await new FacultyRepository().listTitles({ branch_id: branchId });
    res.json({ success: true, data: titles });
  }),
);

router.get(
  '/lookup',
  requirePermission('faculty_members.read'),
  asyncHandler(async (_req, res) => {
    const { rows: departments } = await pool.query(
      'SELECT id, college_id, name_ar, name_en FROM departments ORDER BY id',
    );
    const { rows: branches } = await pool.query(
      "SELECT id, name_ar, name_en, is_headquarters FROM institute_branches WHERE status = 'active' ORDER BY is_headquarters DESC, id",
    );
    res.json({ success: true, data: { departments, branches } });
  }),
);

router.get(
  '/:id',
  validate(facultyParamsSchema),
  requirePermission('faculty_members.read'),
  facultyController.getById,
);

router.post(
  '/',
  validate(createFacultySchema),
  requirePermission('faculty_members.create'),
  facultyController.create,
);

router.patch(
  '/:id',
  validate(updateFacultySchema),
  requirePermission('faculty_members.update'),
  facultyController.update,
);

router.delete(
  '/:id',
  validate(facultyParamsSchema),
  requirePermission('faculty_members.delete'),
  facultyController.remove,
);

export default router;