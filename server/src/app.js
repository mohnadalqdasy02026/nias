import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createRequestLogger } from './utils/logger.js';
import apiRoutes from './routes/index.js';

export const app = express();

if (env.TRUST_PROXY) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '16mb' }));
app.use(createRequestLogger());
app.use('/api', apiLimiter);

app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  );
  next();
});
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), { fallthrough: false }));

app.use('/api/v1', apiRoutes);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'nias-api', time: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);