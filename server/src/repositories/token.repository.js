import crypto from 'node:crypto';
import { pool } from '../config/db.js';

export class TokenRepository {
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async storeRefreshToken({ userId, tokenHash, userAgent, ipAddress, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, tokenHash, userAgent, ipAddress, expiresAt],
    );
    return rows[0].id;
  }

  async findActiveRefreshToken(tokenHash) {
    const { rows } = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
      [tokenHash],
    );
    return rows[0] ?? null;
  }

  async revokeRefreshToken(id) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [id]);
  }

  async revokeAllUserRefreshTokens(userId) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
  }

  async createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt],
    );
  }

  async consumePasswordResetToken(tokenHash) {
    const { rows } = await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = now()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [tokenHash],
    );
    return rows[0]?.user_id ?? null;
  }
}