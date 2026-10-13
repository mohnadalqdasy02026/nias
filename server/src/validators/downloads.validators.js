import { z } from 'zod';

export const downloadIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const downloadFields = {
  title: z.string().trim().min(2),
  category: z.string().trim().optional().nullable(),
  file_path: z.string().trim().min(1),
};

const downloadBody = z.object(downloadFields);

export const createDownloadSchema = z.object({ body: downloadBody });

export const updateDownloadSchema = z.object({ body: downloadBody.partial() });
