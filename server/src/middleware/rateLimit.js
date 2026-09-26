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

// Dedicated limiter for the password (credential) login endpoint.
// Uses both IP and account identifier so a single bot IP or a
// distributed attack on one account gets throttled early.
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const identifier = String(req.body?.identifier ?? '').trim().toLowerCase();
    return identifier ? `login:${req.ip}:${identifier}` : `login:${req.ip}`;
  },
  handler: (_req, _res, _next) => {
    throw new AppError(429, 'TOO_MANY_REQUESTS', 'Too many login attempts, please wait a minute and try again.');
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

// ---------------------------------------------------------------
// Account lockout guard: temporary lock after repeated failures.
// In-memory (single instance OK): after 10 failed logins within a
// rolling 15-minute window the account is locked with an increasing
// cool-down. The counter resets on a successful login.
// ---------------------------------------------------------------
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const BASE_LOCK_MS = 5 * 60 * 1000;
const MAX_LOCK_MS = 30 * 60 * 1000;

const failures = new Map(); // normalized identifier -> [timestamps]

function prune(key, now) {
  const list = failures.get(key);
  if (!list) return;
  const keep = list.filter((t) => now - t < WINDOW_MS);
  if (keep.length === 0) failures.delete(key);
  else failures.set(key, keep);
}

export function recordFailedLogin(identifier) {
  const key = String(identifier ?? '').trim().toLowerCase();
  if (!key) return 0;
  const now = Date.now();
  prune(key, now);
  const list = failures.get(key) ?? [];
  list.push(now);
  failures.set(key, list);
  return list.length;
}

// Returns remaining lock ms (0 when unlocked).
export function loginLockRemainingMs(identifier) {
  const key = String(identifier ?? '').trim().toLowerCase();
  if (!key) return 0;
  const now = Date.now();
  prune(key, now);
  const list = failures.get(key) ?? [];
  if (list.length < MAX_FAILURES) return 0;
  const oldest = list[list.length - MAX_FAILURES];
  const cooldown = Math.min(MAX_LOCK_MS, BASE_LOCK_MS * Math.floor(list.length / MAX_FAILURES));
  const remaining = oldest + cooldown - now;
  return Math.max(0, remaining);
}

export function clearFailedLogins(identifier) {
  const key = String(identifier ?? '').trim().toLowerCase();
  if (key) failures.delete(key);
}

export function assertLoginAllowed(identifier) {
  const remaining = loginLockRemainingMs(identifier);
  if (remaining > 0) {
    const seconds = Math.ceil(remaining / 1000);
    throw new AppError(
      429,
      'ACCOUNT_LOCKED',
      `Account temporarily locked after too many failed attempts. Try again in ${seconds} seconds.`,
    );
  }
}