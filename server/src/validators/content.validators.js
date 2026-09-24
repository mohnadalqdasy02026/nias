import { z } from 'zod';

const idParams = z.object({ id: z.coerce.number().int().positive() });

export const listNewsSchema = {
  query: z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

const newsBody = z.object({
  category_id: z.coerce.number().int().positive().nullable().optional(),
  content_type: z.enum(['news', 'event', 'activity', 'course']).optional(),
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  title_ar: z.string().trim().min(2).max(255),
  title_en: z.string().trim().max(255).nullable().optional(),
  summary_ar: z.string().trim().max(500).nullable().optional(),
  summary_en: z.string().trim().max(500).nullable().optional(),
  body_ar: z.string().max(20000).nullable().optional(),
  body_en: z.string().max(20000).nullable().optional(),
  cover_image: z.string().trim().max(500).nullable().optional(),
  is_featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const createNewsSchema = { body: newsBody };
export const updateNewsSchema = { params: idParams, body: newsBody.partial() };
export const getNewsAdminParams = { params: idParams };
export const newsStatusSchema = {
  params: idParams,
  body: z.object({ status: z.enum(['draft', 'published', 'archived']) }),
};

export const categoryBody = z.object({
  name_ar: z.string().trim().min(2).max(150),
  name_en: z.string().trim().max(150).nullable().optional(),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/),
});
export const createCategorySchema = { body: categoryBody };
export const updateCategorySchema = { params: idParams, body: categoryBody.partial() };
export const categoryParams = { params: idParams };

const pageBody = z.object({
  slug: z.string().trim().min(2).max(190).regex(/^[a-z0-9-]+$/),
  title_ar: z.string().trim().min(2).max(255),
  title_en: z.string().trim().max(255).nullable().optional(),
  content_ar: z.string().max(50000).nullable().optional(),
  content_en: z.string().max(50000).nullable().optional(),
  primary_image: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
export const createPageSchema = { body: pageBody };
export const updatePageSchema = { params: idParams, body: pageBody.partial() };
export const getPageAdminParams = { params: idParams };