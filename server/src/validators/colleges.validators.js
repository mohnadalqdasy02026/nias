import { z } from 'zod';
import { goalsField } from './common.js';

export const collegeIdParamsSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

const collegeFields = z.object({
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  name_ar: z.string().trim().min(2).max(255),
  name_en: z.string().trim().max(255).optional().nullable(),
  vision: z.string().trim().max(5000).optional().nullable(),
  mission: z.string().trim().max(5000).optional().nullable(),
  goals: goalsField,
  about: z.string().trim().max(10000).optional().nullable(),
  dean_name: z.string().trim().max(255).optional().nullable(),
  dean_name_ar: z.string().trim().max(255).optional().nullable(),
  dean_name_en: z.string().trim().max(255).optional().nullable(),
  dean_message_ar: z.string().trim().max(5000).optional().nullable(),
  dean_message_en: z.string().trim().max(5000).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
  dean_image: z.string().trim().max(500).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const createCollegeSchema = {
  body: collegeFields,
};

export const updateCollegeSchema = {
  body: collegeFields.partial(),
};

export const departmentParamsSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

const departmentFields = z.object({
  college_id: z.coerce.number().int().positive(),
  name_ar: z.string().trim().min(2).max(255),
  name_en: z.string().trim().max(255).optional().nullable(),
  description: z.string().trim().max(10000).optional().nullable(),
  vision: z.string().trim().max(5000).optional().nullable(),
  mission: z.string().trim().max(5000).optional().nullable(),
  goals: goalsField,
  head_name_ar: z.string().trim().max(255).optional().nullable(),
  head_title: z.string().trim().max(255).optional().nullable(),
  head_photo: z.string().trim().max(500).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
});

export const createDepartmentSchema = {
  body: departmentFields,
};

export const updateDepartmentSchema = {
  body: departmentFields.partial(),
};
