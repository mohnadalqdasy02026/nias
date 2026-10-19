import { z } from 'zod';

const STATUS_VALUES = ['draft', 'published', 'archived'];

export const journalIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const issueFields = {
  title: z.string().trim().min(2),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  cover: z.string().trim().optional().nullable(),
  file_path: z.string().trim().optional().nullable(),
  issue_number: z.string().trim().optional().nullable(),
  published_at: z.string().trim().optional().nullable(),
  status: z.enum(STATUS_VALUES).optional(),
};

const issueBody = z.object(issueFields);

export const createJournalIssueSchema = z.object({ body: issueBody });

export const updateJournalIssueSchema = z.object({ body: issueBody.partial() });
