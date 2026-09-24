import { describe, it, expect, vi } from 'vitest';
import { success, created } from '../src/utils/asyncHandler.js';

function makeRes() {
  const json = vi.fn((body) => body);
  const res = { json };
  res.status = vi.fn(() => res);
  return res;
}

describe('response helpers', () => {
  it('success sends 200 with data', () => {
    const res = makeRes();
    success(res, { x: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { x: 1 } });
  });

  it('created sends 201', () => {
    const res = makeRes();
    created(res, { id: 5 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 5 } });
  });
});