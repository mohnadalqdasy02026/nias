import { config as loadEnv } from 'dotenv';
import crypto from 'node:crypto';

loadEnv();

// JWT secrets must be strong (>= 32 bytes) and unique per branch of a
// secret. 'replace-me' and dev placeholders are rejected in production
// and logged loudly in development so nobody ships a forgeable token.
const WEAK_SECRETS = new Set(['replace-me', 'dev-access-secret-change-me', 'dev-refresh-secret-change-me']);

function validateSecret(value, name, required) {
  const present = value != null && value.length > 0 && !WEAK_SECRETS.has(value);
  if (!present) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] ${name} is required and must be a strong random value in production`);
    }
    const generated = crypto.randomBytes(48).toString('base64url');
    console.warn(`[env] WARNING: ${name} not set or weak in ${process.env.NODE_ENV}; using a random value for this process only.`);
    return generated;
  }
  if (Buffer.byteLength(value, 'utf8') < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] ${name} is too short (< 32 bytes) for HS256 signing`);
    }
    console.warn(`[env] WARNING: ${name} is shorter than 32 bytes (current ${Buffer.byteLength(value, 'utf8')} bytes). Tokens may be forgeable.`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  HOST: process.env.HOST ?? '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://nias:nias@localhost:5432/nias',
  JWT_ACCESS_SECRET: validateSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: validateSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
};