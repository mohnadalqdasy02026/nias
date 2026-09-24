import { pool } from '../config/db.js';

const USER_COLUMNS = `u.id, u.full_name_ar, u.full_name_en, u.email, u.phone, u.profile_image, u.status, u.branch_id, u.created_at, u.updated_at,
       b.name_ar AS branch_name_ar, b.is_headquarters AS branch_is_hq`;

export class AdminUserRepository {
  async list({ search, status, role, page = 1, limit = 20 } = {}) {
    const conditions = ['u.deleted_at IS NULL'];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.full_name_ar ILIKE $${params.length} OR u.full_name_en ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`u.status = $${params.length}`);
    }
    if (role) {
      params.push(role);
      conditions.push(`EXISTS (SELECT 1 FROM user_roles urx JOIN roles rx ON rx.id = urx.role_id WHERE urx.user_id = u.id AND rx.name = $${params.length})`);
    }

    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT ${USER_COLUMNS},
              COALESCE((
                SELECT string_agg(r2.name, ', ' ORDER BY r2.name)
                FROM user_roles ur2 JOIN roles r2 ON r2.id = ur2.role_id WHERE ur2.user_id = u.id
              ), '') AS roles_list
         FROM users u
         LEFT JOIN institute_branches b ON b.id = u.branch_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return { items: rows, total: await this.count({ search, status, role }), page, limit };
  }

  async count({ search, status, role } = {}) {
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name_ar ILIKE $${params.length} OR full_name_en ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (role) {
      params.push(role);
      conditions.push(`EXISTS (SELECT 1 FROM user_roles urx JOIN roles rx ON rx.id = urx.role_id WHERE urx.user_id = id AND rx.name = $${params.length})`);
    }
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM users WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows[0].count;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${USER_COLUMNS},
              COALESCE((
                SELECT string_agg(r2.name, ', ' ORDER BY r2.name)
                FROM user_roles ur2 JOIN roles r2 ON r2.id = ur2.role_id WHERE ur2.user_id = u.id
              ), '') AS roles_list
         FROM users u
         LEFT JOIN institute_branches b ON b.id = u.branch_id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  }

  async findByPhone(phone) {
    const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    return rows[0] ?? null;
  }

  async findBranch(branchId) {
    const { rows } = await pool.query(
      `SELECT id FROM institute_branches WHERE id = $1 AND status = 'active'`,
      [branchId],
    );
    return rows[0] ?? null;
  }

  async countActiveAdministrators(excludeUserId = null) {
    const params = [excludeUserId];
    let extra = 'AND u.id <> $1';
    if (excludeUserId == null) {
      params.length = 0;
      extra = '';
    }
    const { rows } = await pool.query(
      `SELECT count(DISTINCT u.id)::int AS count
         FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE r.name = 'Administrator' AND u.status = 'active' AND u.deleted_at IS NULL ${extra}`,
      params,
    );
    return rows[0].count;
  }

  async create({ full_name_ar, full_name_en, email, phone, password_hash, profile_image, status, branch_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO users (full_name_ar, full_name_en, email, phone, password_hash, profile_image, status, branch_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [full_name_ar, full_name_en ?? null, email ?? null, phone ?? null, password_hash, profile_image ?? null, status ?? 'active', branch_id ?? null],
      );
      await client.query('COMMIT');
      return rows[0].id;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async setRoles(userId, roleIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      for (const roleId of roleIds) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getRoleIds(names) {
    if (!names || names.length === 0) return [];
    const { rows } = await this.findRolesByNames(names);
    return rows.map((r) => r.id);
  }

  async findRolesByNames(names) {
    if (!names || names.length === 0) return { rows: [] };
    const placeholders = names.map((_, i) => `$${i + 1}`).join(', ');
    return pool.query(
      `SELECT id, name FROM roles WHERE name IN (${placeholders})`,
      names,
    );
  }

  async update(id, fields) {
    const sets = [];
    const params = [];
    for (const [key, value] of Object.entries(fields)) {
      params.push(value);
      sets.push(`${key} = $${params.length}`);
    }
    if (sets.length === 0) return this.findById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} AND deleted_at IS NULL RETURNING id`,
      params,
    );
    return rows[0] ?? null;
  }

  async softDelete(id) {
    const { rows } = await pool.query(
      `UPDATE users SET deleted_at = now(), status = 'banned'
        WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id],
    );
    return rows[0] ?? null;
  }
}