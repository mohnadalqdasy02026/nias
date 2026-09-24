import { z } from 'zod';

export const PROGRAM_TYPES = ['bachelor', 'diploma', 'master_executive', 'master_academic'];

export const listProgramsSchema = {
  query: z.object({
    search: z.string().trim().max(150).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    program_type: z.enum(PROGRAM_TYPES).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const programParamsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

const baseProgramFields = z.object({
  college_id: z.coerce.number().int().positive().optional().nullable(),
  department_id: z.coerce.number().int().positive().optional().nullable(),
  branch_id: z.coerce.number().int().positive().optional().nullable(),
  name_ar: z.string().trim().min(2).max(255),
  name_en: z.string().trim().max(255).optional().nullable(),
  program_type: z.enum(PROGRAM_TYPES),
  description: z.string().trim().max(5000).optional().nullable(),
  outcomes: z.string().trim().max(5000).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  admission_open: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const createProgramSchema = {
  body: baseProgramFields,
};

export const updateProgramSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: baseProgramFields
    .partial()
    .refine((b) => Object.keys(b).length > 0, { message: 'Nothing to update' }),
};