import { z } from 'zod';

export const listMediaSchema = {
  query: z.object({
    search: z.string().trim().max(100).optional(),
    type: z.string().trim().max(50).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const uploadMediaSchema = {
  body: z
    .object({
      file_name: z.string().trim().max(255).optional(),
      mime_type: z.string().trim().max(50),
      data_base64: z.string().min(16),
      alt_text: z.string().trim().max(255).optional().nullable(),
    })
    .refine((b) => b.data_base64.length <= 12_000_000, {
      message: 'File too large',
      path: ['data_base64'],
    }),
};

export const mediaParamsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const updateMediaSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z
    .object({
      alt_text: z.string().trim().max(255).optional(),
      file_name: z.string().trim().max(255).optional(),
    })
    .refine((b) => b.alt_text !== undefined || b.file_name !== undefined, {
      message: 'Nothing to update',
    }),
};