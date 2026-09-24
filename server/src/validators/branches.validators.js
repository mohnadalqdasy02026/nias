import { z } from 'zod';

export const branchIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name_ar: z.string().trim().min(2).optional(),
    name_en: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    dean_name_ar: z.string().trim().optional().nullable(),
    dean_name_en: z.string().trim().optional().nullable(),
    dean_message_ar: z.string().trim().optional().nullable(),
    dean_message_en: z.string().trim().optional().nullable(),
  }),
});