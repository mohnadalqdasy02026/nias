import { pino } from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'nias-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
});

export function createRequestLogger() {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info(
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
        },
        'http',
      );
    });
    next();
  };
}