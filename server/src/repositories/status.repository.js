import { pool } from '../config/db.js';

export class StatusRepository {
  async checkDb() {
    const { rows } = await pool.query('SELECT now() AS time, version() AS version');
    return rows[0];
  }

  async health() {
    return { status: 'ok', service: 'nias-api' };
  }
}