import { pool } from '../config/db.js';

function parseValue(row) {
  if (!row) return null;
  if (row.setting_type === 'json') {
    try {
      return JSON.parse(row.setting_value ?? '{}');
    } catch {
      return {};
    }
  }
  return row.setting_value;
}

export class SettingsRepository {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT setting_key, setting_value, setting_type, is_public, updated_at
         FROM site_settings ORDER BY setting_key`,
    );
    return rows.map((row) => ({
      key: row.setting_key,
      value: parseValue(row),
      updated_at: row.updated_at,
    }));
  }

  async getGroup(key) {
    const { rows } = await pool.query(
      `SELECT setting_value, setting_type FROM site_settings WHERE setting_key = $1`,
      [key],
    );
    return parseValue(rows[0]);
  }

  async upsert(key, value) {
    const { rows } = await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value, setting_type, is_public, updated_at)
       VALUES ($1, $2::text, 'json', TRUE, NOW())
       ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value, setting_type = 'json', is_public = TRUE, updated_at = NOW()
       RETURNING setting_key, setting_value, setting_type, is_public, updated_at`,
      [key, JSON.stringify(value)],
    );
    return parseValue(rows[0]);
  }
}