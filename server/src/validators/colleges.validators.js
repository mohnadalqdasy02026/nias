import { z } from 'zod';

export const collegeIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const collegeFields = {
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  name_ar: z.string().trim().min(2).optional(),
  name_en: z.string().trim().optional().nullable(),
  vision: z.string().trim().optional().nullable(),
  mission: z.string().trim().optional().nullable(),
  about: z.string().trim().optional().nullable(),
  dean_name: z.string().trim().optional().nullable(),
  dean_name_ar: z.string().trim().optional().nullable(),
  dean_name_en: z.string().trim().optional().nullable(),
  dean_message_ar: z.string().trim().optional().nullable(),
  dean_message_en: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  dean_image: z.string().trim().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
};

export const createCollegeSchema = z.object({
  body: collegeFields,
});

export const updateCollegeSchema = z.object({
  body: collegeFields,
});

export const departmentParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const departmentBodySchema = z.object({
  college_id: z.coerce.number().int().positive(),
  name_ar: z.string().trim().min(2),
  name_en: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  head_name_ar: z.string().trim().optional().nullable(),
  head_title: z.string().trim().optional().nullable(),
  head_photo: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
});

export const createDepartmentSchema = z.object({
  body: departmentBodySchema,
});

export const updateDepartmentSchema = z.object({
  body: departmentBodySchema.partial(),
});