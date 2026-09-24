import { z } from 'zod';

export const listNewsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(9),
    categoryId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
  }),
};

export const listTrainingCoursesSchema = {
  query: z.object({
    branchId: z.coerce.number().int().positive().optional(),
  }),
};

export const getBranchParams = {
  params: z.object({ slug: z.string().min(1).max(190) }),
};

export const listProgramsSchema = {
  query: z.object({
    open: z.enum(['true', 'false']).optional(),
  }),
};

export const getNewsParams = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const getProgramParams = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const getPageParams = {
  params: z.object({ slug: z.string().min(1).max(190) }),
};

export const searchSchema = {
  query: z.object({
    q: z.string().trim().min(2).max(100),
  }),
};

export const contactSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(190),
    email: z.string().trim().email(),
    phone: z.string().trim().max(20).optional().nullable(),
    subject: z.string().trim().max(255).optional().nullable(),
    message: z.string().trim().min(5).max(5000),
  }),
};