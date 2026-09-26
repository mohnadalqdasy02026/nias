import { nanoid } from 'nanoid';
import crypto from 'node:crypto';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_TTL_MS,
} from '../utils/jwt.js';
import { hashToken } from '../utils/token.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenRepository } from '../repositories/token.repository.js';
import {
  assertLoginAllowed,
  clearFailedLogins,
  recordFailedLogin,
} from '../middleware/rateLimit.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 min

export class AuthService {
  constructor(userRepo = new UserRepository(), tokenRepo = new TokenRepository()) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
  }

  async login({ identifier, password, userAgent, ipAddress }) {
    assertLoginAllowed(identifier);
    const user = await this.userRepo.findWithPasswordByIdentifier(identifier);
    if (!user || user.status !== 'active') {
      recordFailedLogin(identifier);
      throw AppError.unauthorized('Invalid credentials');
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      recordFailedLogin(identifier);
      throw AppError.unauthorized('Invalid credentials');
    }

    clearFailedLogins(identifier);
    const { roles, permissions } = await this.userRepo.findRolesAndPermissions(user.id);
    const tokens = await this.issueTokens(user, userAgent, ipAddress);

    return { user: this.mapUser(user, roles, permissions), ...tokens };
  }

  async refresh({ refreshToken, userAgent, ipAddress }) {
    if (!refreshToken) throw AppError.unauthorized('Missing refresh token');
    const payload = verifyRefreshToken(refreshToken);
    const stored = await this.tokenRepo.findActiveRefreshToken(hashToken(refreshToken));
    if (!stored || String(stored.user_id) !== String(payload.sub)) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    await this.tokenRepo.revokeRefreshToken(stored.id);

    const user = await this.userRepo.findById(stored.user_id);
    if (!user || user.status !== 'active') throw AppError.unauthorized('Account unavailable');

    const { roles, permissions } = await this.userRepo.findRolesAndPermissions(user.id);
    const tokens = await this.issueTokens(user, userAgent, ipAddress);
    return { user: this.mapUser(user, roles, permissions), ...tokens };
  }

  async logout({ refreshToken }) {
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      const stored = await this.tokenRepo.findActiveRefreshToken(hashToken(refreshToken));
      if (stored) await this.tokenRepo.revokeRefreshToken(stored.id);
    }
  }

  async logoutAll(userId) {
    await this.tokenRepo.revokeAllUserRefreshTokens(userId);
  }

  async requestPasswordReset({ identifier, userAgent }) {
    const user = await this.userRepo.findWithPasswordByIdentifier(identifier);
    // RFC-suggested: always return success to avoid user enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.tokenRepo.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    // NOTE: SMTP channel is not configured yet (Unknown). In production this URL
    // must be emailed. For development the token is returned in the response
    // debug field ONLY when NODE_ENV !== 'production'.
    return { resetToken, expiresIn: RESET_TOKEN_TTL_MS / 1000 };
  }

  async resetPassword({ token, newPassword, userAgent }) {
    const userId = await this.tokenRepo.consumePasswordResetToken(hashToken(token));
    if (!userId) throw AppError.badRequest('Invalid or expired reset token');

    const passwordHash = await hashPassword(newPassword);
    await this.userRepo.updatePasswordHash(userId, passwordHash);
  }

  async issueTokens(user, userAgent, ipAddress) {
    const jti = nanoid(21);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, jti);
    await this.tokenRepo.storeRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    return { accessToken, refreshToken, accessTokenExpiresIn: 900 };
  }

  mapUser(user, roles, permissions) {
    return {
      id: user.id,
      nameAr: user.full_name_ar,
      nameEn: user.full_name_en,
      email: user.email,
      phone: user.phone,
      profileImage: user.profile_image,
      branchId: user.branch_id,
      roles,
      permissions,
    };
  }
}