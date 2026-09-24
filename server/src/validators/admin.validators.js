import { z } from 'zod';

export const listContactMessagesSchema = {
  query: z.object({
    status: z.enum(['new', 'read', 'replied']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const getContactMessageParams = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const updateContactMessageStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    status: z.enum(['new', 'read', 'replied']),
  }),
};