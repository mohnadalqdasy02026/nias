import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), type: 'access', role: user.primaryRole ?? null },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TTL },
  );
}

export function signRefreshToken(user, jti) {
  return jwt.sign(
    { sub: String(user.id), type: 'refresh', jti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TTL },
  );
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== 'access') throw new Error('Not an access token');
    return payload;
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') throw new Error('Not a refresh token');
    return payload;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ACCESS_TTL_S = 15 * 60; // 900 seconds