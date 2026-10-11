import { z } from 'zod';

export const albumIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const imageIdParamsSchema = z.object({
  params: z.object({
    imageId: z.coerce.number().int().positive(),
  }),
});

const albumFields = {
  title: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  cover_image: z.string().trim().optional().nullable(),
  event_date: z.string().trim().optional().nullable(),
  sort_order: z.coerce.number().int().optional(),
  is_published: z.boolean().optional(),
};

const albumBody = z.object(albumFields);

export const createAlbumSchema = z.object({ body: albumBody });

export const updateAlbumSchema = z.object({ body: albumBody.partial() });

const imageFields = {
  title: z.string().trim().optional().nullable(),
  image: z.string().trim().min(1),
  link: z.string().trim().optional().nullable(),
  sort_order: z.coerce.number().int().optional(),
};

const imageBody = z.object(imageFields);

export const createImageSchema = z.object({ body: imageBody });

export const updateImageSchema = z.object({ body: imageBody.partial() });
