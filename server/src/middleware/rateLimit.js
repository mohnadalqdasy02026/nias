import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new AppError(429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later.');
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new AppError(429, 'TOO_MANY_REQUESTS', 'Too many authentication attempts, please try again later.');
  },
});

export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new AppError(429, 'TOO_MANY_REQUESTS', 'Too many password reset attempts, please try again later.');
  },
});

export const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new AppError(429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later.');
  },
});