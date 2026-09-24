import { pool } from '../config/db.js';

export class RolesRepository {
  async list() {
    const { rows } = await pool.query(
      `SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
              (SELECT count(*)::int FROM role_permissions rp WHERE rp.role_id = r.id) AS permissions_count,
              (SELECT count(*)::int FROM user_roles ur WHERE ur.role_id = r.id) AS members_count
         FROM roles r
        ORDER BY r.name`,
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT id, name, description FROM roles WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async findByName(name) {
    const { rows } = await pool.query('SELECT id FROM roles WHERE name = $1', [name]);
    return rows[0] ?? null;
  }

  async create({ name, description }) {
    const { rows } = await pool.query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name, description ?? null],
    );
    return rows[0];
  }

  async update(id, { name, description }) {
    const { rows } = await pool.query(
      `UPDATE roles SET name = COALESCE($2, name), description = COALESCE($3, description)
        WHERE id = $1 RETURNING id, name, description`,
      [id, name ?? null, description ?? null],
    );
    return rows[0] ?? null;
  }

  async delete(id) {
    const { rows } = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return rows[0] ?? null;
  }

  async countMembers(id) {
    const { rows } = await pool.query(
      'SELECT count(*)::int AS count FROM user_roles WHERE role_id = $1',
      [id],
    );
    return rows[0].count;
  }

  async permissions() {
    const { rows } = await pool.query(
      'SELECT id, code, description FROM permissions ORDER BY code',
    );
    return rows;
  }

  async permissionCodes() {
    const { rows } = await pool.query('SELECT code FROM permissions');
    return rows.map((r) => r.code);
  }

  async getRolePermissionCodes(roleId) {
    const { rows } = await pool.query(
      `SELECT p.code FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [roleId],
    );
    return rows.map((r) => r.code);
  }

  async setRolePermissions(roleId, codes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
      if (codes && codes.length > 0) {
        const placeholders = codes.map((_, i) => `$${i + 1}`).join(', ');
        const { rows } = await client.query(
          `SELECT id FROM permissions WHERE code IN (${placeholders})`,
          codes,
        );
        for (const p of rows) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [roleId, p.id],
          );
        }
        await client.query('COMMIT');
        return rows.length;
      }
      await client.query('COMMIT');
      return 0;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}