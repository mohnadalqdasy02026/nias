import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    identifier: z.string().min(3, 'Identifier is too short').max(190),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const logoutSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const requestResetSchema = {
  body: z.object({
    identifier: z.string().min(3).max(190),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
};