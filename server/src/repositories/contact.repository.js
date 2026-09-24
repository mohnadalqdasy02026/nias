import { pool } from '../config/db.js';

export class ContactRepository {
  async create({ name, email, phone, subject, message }) {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, status, created_at`,
      [name, email, phone, subject, message],
    );
    return rows[0];
  }
}