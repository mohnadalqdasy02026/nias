import { describe, it, expect, vi } from 'vitest';
import { requirePermission, requireRole } from '../src/middleware/auth.js';
import { AppError } from '../src/utils/AppError.js';

function makeCtx(permissions = [], roles = []) {
  const req = { user: { id: 1, permissions, roles } };
  const res = {};
  const next = vi.fn();
  return { req, res, next };
}

describe('RBAC middleware', () => {
  it('allows access when permission present', () => {
    const { req, res, next } = makeCtx(['news.read'], []);
    requirePermission('news.read')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it('forbids when permission missing', () => {
    const { req, res, next } = makeCtx(['news.read'], []);
    requirePermission('news.publish')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].code).toBe('FORBIDDEN');
  });

  it('allows role access', () => {
    const { req, res, next } = makeCtx([], ['Administrator']);
    requireRole('Administrator')(req, res, next);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it('forbids when role missing', () => {
    const { req, res, next } = makeCtx([], ['Guest']);
    requireRole('Administrator')(req, res, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('requires authentication', () => {
    const req = {};
    const res = {};
    const next = vi.fn();
    requirePermission('x')(req, res, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].code).toBe('UNAUTHORIZED');
  });
});