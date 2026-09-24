import { pool } from '../config/db.js';

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/i;

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.assertIdentifier(tableName, 'table');
  }

  assertIdentifier(value, label) {
    if (!IDENTIFIER.test(value)) {
      throw new Error(`Invalid ${label} identifier: ${value}`);
    }
  }

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async findOne(where, params = []) {
    const conditions = Object.entries(where)
      .map(([k], i) => `${k} = $${i + 1}`)
      .join(' AND ');
    const { rows } = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE ${conditions} LIMIT 1`,
      [...Object.values(where), ...params],
    );
    return rows[0] ?? null;
  }

  async findAll({ where = {}, orderBy = 'id', limit = 100, offset = 0 } = {}) {
    const keys = Object.keys(where);
    const conditions = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const params = [...Object.values(where), limit, offset];
    const whereSql = conditions ? `WHERE ${conditions}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM ${this.tableName} ${whereSql} ORDER BY ${orderBy} LIMIT $${keys.length + 1} OFFSET $${keys.length + 2}`,
      params,
    );
    return rows;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...Object.values(data), id],
    );
    return rows[0] ?? null;
  }

  async delete(id) {
    const { rowCount } = await pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    return rowCount > 0;
  }

  async count(where = {}) {
    const keys = Object.keys(where);
    const conditions = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const { rows } = await pool.query(
      `SELECT count(*)::int AS count FROM ${this.tableName} ${conditions ? `WHERE ${conditions}` : ''}`,
      Object.values(where),
    );
    return rows[0].count;
  }
}