import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Resource not found' },
  });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Malformed JSON body' },
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds size limit' },
    });
  }

  if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message || 'Resource not found' },
    });
  }

  logger.error({ err }, 'unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}