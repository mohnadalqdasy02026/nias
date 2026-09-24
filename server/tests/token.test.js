import { describe, it, expect, vi } from 'vitest';
import { hashToken } from '../src/utils/token.js';

describe('token util', () => {
  it('hashes a token deterministically (sha256 hex)', () => {
    const a = hashToken('token-abc');
    const b = hashToken('token-abc');
    expect(a).toHaveLength(64);
    expect(a).toBe(b);
  });

  it('produces different hashes for different tokens', () => {
    expect(hashToken('abc')).not.toBe(hashToken('def'));
  });
});