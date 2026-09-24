import { config as loadEnv } from 'dotenv';

loadEnv();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  HOST: process.env.HOST ?? '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://nias:nias@localhost:5432/nias',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'replace-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'replace-me',
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
};