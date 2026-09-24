import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`[nias-api] listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal) => {
  console.log(`[nias-api] received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));