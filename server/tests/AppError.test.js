import { describe, it, expect } from 'vitest';
import { AppError } from '../src/utils/AppError.js';

describe('AppError', () => {
  it('builds a bad request error', () => {
    const err = AppError.badRequest('invalid input');
    expect(err.status).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('invalid input');
    expect(err).toBeInstanceOf(AppError);
  });

  it('builds a not found error', () => {
    const err = AppError.notFound();
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('builds an unauthorized error', () => {
    const err = AppError.unauthorized();
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });
});