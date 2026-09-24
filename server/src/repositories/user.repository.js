import { pool } from '../config/db.js';

export class UserRepository {
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, full_name_ar, full_name_en, email, phone, password_hash, profile_image, status, branch_id
       FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findWithPasswordByIdentifier(identifier) {
    if (!identifier) return null;
    // 1) try email
    const byEmail = await this.findWithPasswordByEmail(identifier);
    if (byEmail) return byEmail;
    // 2) try phone
    const byPhone = await this.findWithPasswordByPhone(identifier);
    if (byPhone) return byPhone;
    // 3) try student academic_number
    const byAcademic = await this.findByAcademicNumber(identifier);
    if (byAcademic) return byAcademic;
    return null;
  }

  async findWithPasswordByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, full_name_ar, full_name_en, email, phone, password_hash, profile_image, status, branch_id
       FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findWithPasswordByPhone(phone) {
    const { rows } = await pool.query(
      `SELECT id, full_name_ar, full_name_en, email, phone, password_hash, profile_image, status, branch_id
       FROM users WHERE phone = $1`,
      [phone],
    );
    return rows[0] ?? null;
  }

  async findByAcademicNumber(academicNumber) {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name_ar, u.full_name_en, u.email, u.phone, u.password_hash, u.profile_image, u.status, u.branch_id
       FROM users u
       INNER JOIN students s ON s.user_id = u.id
       WHERE s.academic_number = $1`,
      [academicNumber],
    );
    return rows[0] ?? null;
  }

  async findRolesAndPermissions(userId) {
    const { rows } = await pool.query(
      `SELECT DISTINCT p.code AS permission, r.name AS role
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [userId],
    );
    const roles = [...new Set(rows.map((r) => r.role))];
    const permissions = [...new Set(rows.map((r) => r.permission).filter(Boolean))];
    return { roles, permissions };
  }

  async updatePassword(userId, passwordHash) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
  }

  async updatePasswordHash(userId, hash) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
  }
}