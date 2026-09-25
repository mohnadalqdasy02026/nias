import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.js';
import { pool } from './config/db.js';
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
app.use('/uploads/design', express.static(path.resolve(process.cwd(), 'web/dist/uploads/design'), { fallthrough: true }));
app.use('/uploads/design', express.static(path.resolve(process.cwd(), 'web/public/uploads/design'), { fallthrough: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), { fallthrough: true }));
app.get('/uploads/:file', async (req, res, next) => {
  try {
    const row = await pool.query(
      'SELECT file_type, data FROM media_library WHERE file_path = $1 AND data IS NOT NULL LIMIT 1',
      [req.params.file],
    );
    const hit = row.rows[0];
    if (!hit) return next();
    res.setHeader('Content-Type', hit.file_type);
    res.setHeader('Content-Length', hit.data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(hit.data);
  } catch (err) {
    next(err);
  }
});

app.use('/api/v1', apiRoutes);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'nias-api', time: new Date().toISOString() });
});

const webDist = path.resolve(process.cwd(), 'web/dist');
app.use(express.static(webDist));
app.get(/^\/(?!api|uploads|healthz).*/, (_req, res, next) => {
  res.sendFile(path.join(webDist, 'index.html'), (err) => {
    if (err && err.code !== 'ENOENT') next(err);
  });
});

app.use(notFoundHandler);
app.use(errorHandler);