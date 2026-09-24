import { z } from 'zod';

export const listUsersSchema = {
  query: z.object({
    search: z.string().trim().max(150).optional(),
    status: z.enum(['active', 'banned']).optional(),
    role: z.string().trim().max(50).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const userIdParamsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const createUserSchema = {
  body: z.object({
    full_name_ar: z.string().trim().min(2).max(255),
    full_name_en: z.string().trim().max(255).optional().nullable(),
    email: z.string().email().toLowerCase().max(190).optional().nullable(),
    phone: z.string().trim().max(20).optional().nullable(),
    password: z.string().min(8).max(128),
    profile_image: z.string().trim().max(500).optional().nullable(),
    branch_id: z.coerce.number().int().positive().nullable().optional(),
    status: z.enum(['active', 'banned']).default('active'),
    roles: z.array(z.string().trim().min(1)).max(10).optional(),
  }),
};

export const updateUserSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z
    .object({
      full_name_ar: z.string().trim().min(2).max(255).optional(),
      full_name_en: z.string().trim().max(255).optional().nullable(),
      email: z.string().email().toLowerCase().max(190).optional().nullable(),
      phone: z.string().trim().max(20).optional().nullable(),
      password: z.string().min(8).max(128).optional(),
      branch_id: z.coerce.number().int().positive().nullable().optional(),
      status: z.enum(['active', 'banned']).optional(),
      roles: z.array(z.string().trim().min(1)).max(10).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: 'Nothing to update' }),
};

export const createRoleSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(255).optional().nullable(),
  }),
};

export const updateRoleSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z
    .object({
      name: z.string().trim().min(2).max(50).optional(),
      description: z.string().trim().max(255).optional().nullable(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: 'Nothing to update' }),
};

export const roleIdParamsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const rolePermissionsSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    permissions: z.array(z.string().trim().min(1)).max(300),
  }),
};