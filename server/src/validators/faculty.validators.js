import { z } from 'zod';

export const listFacultySchema = {
  query: z.object({
    search: z.string().trim().max(150).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    department_id: z.coerce.number().int().positive().optional(),
    branch_id: z.coerce.number().int().positive().optional(),
    title: z.string().trim().max(190).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const facultyParamsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

const baseFacultyFields = z.object({
  department_id: z.coerce.number().int().positive().optional().nullable(),
  branch_id: z.coerce.number().int().positive().optional().nullable(),
  name_ar: z.string().trim().min(3).max(255),
  name_en: z.string().trim().max(255).optional().nullable(),
  title: z.string().trim().max(190).optional().nullable(),
  specialization: z.string().trim().max(255).optional().nullable(),
  email: z.string().trim().email().max(190).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  photo: z.string().trim().max(500).optional().nullable(),
  is_dept_head: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional(),
});

export const createFacultySchema = {
  body: baseFacultyFields,
};

export const updateFacultySchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: baseFacultyFields
    .partial()
    .refine((b) => Object.keys(b).length > 0, { message: 'Nothing to update' }),
};