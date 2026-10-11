import { pool } from '../config/db.js';

const SELECT_ALBUM = `
  SELECT a.id, a.title, a.description, a.cover_image, a.event_date,
         a.sort_order, a.is_published, a.created_at, a.updated_at,
         COALESCE(
           a.cover_image,
           (SELECT i.image FROM gallery_items i
             WHERE i.album_id = a.id ORDER BY i.sort_order, i.id LIMIT 1)
         ) AS effective_cover,
         (SELECT count(*)::int FROM gallery_items i WHERE i.album_id = a.id) AS image_count
    FROM gallery_albums a`;

const SELECT_ITEM = `
  SELECT i.id, i.title, i.image, i.link, i.sort_order, i.album_id,
         a.title AS album_title, i.created_at, i.updated_at
    FROM gallery_items i
    LEFT JOIN gallery_albums a ON a.id = i.album_id`;

export class GalleryRepository {
  async listAlbums() {
    const { rows } = await pool.query(
      `${SELECT_ALBUM} ORDER BY a.sort_order, a.id`,
    );
    return rows;
  }

  async findAlbumById(id) {
    const { rows } = await pool.query(`${SELECT_ALBUM} WHERE a.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async createAlbum(data) {
    const { rows } = await pool.query(
      `INSERT INTO gallery_albums (title, description, cover_image, event_date, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.title,
        data.description?.trim() ? data.description : null,
        data.cover_image?.trim() ? data.cover_image : null,
        data.event_date || null,
        data.sort_order ?? 0,
        data.is_published ?? true,
      ],
    );
    return this.findAlbumById(rows[0].id);
  }

  async updateAlbum(id, data) {
    const fields = ['title', 'description', 'cover_image', 'event_date', 'sort_order', 'is_published'];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      params.push(data[f] === '' ? null : data[f]);
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) return this.findAlbumById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE gallery_albums SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findAlbumById(rows[0].id) : null;
  }

  async removeAlbum(id) {
    const { rows } = await pool.query('DELETE FROM gallery_albums WHERE id = $1 RETURNING id', [id]);
    return rows[0] ? true : false;
  }

  async listItems(albumId = undefined) {
    const params = [];
    let where = '';
    if (albumId === null) {
      where = 'WHERE i.album_id IS NULL';
    } else if (albumId !== undefined) {
      params.push(albumId);
      where = 'WHERE i.album_id = $1';
    }
    const { rows } = await pool.query(
      `${SELECT_ITEM} ${where} ORDER BY i.album_id NULLS FIRST, i.sort_order, i.id`,
      params,
    );
    return rows;
  }

  async findItemById(id) {
    const { rows } = await pool.query(`${SELECT_ITEM} WHERE i.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async nextItemSort(albumId) {
    const { rows } = await pool.query(
      `SELECT COALESCE(max(sort_order), -1) + 1 AS next
         FROM gallery_items WHERE ${albumId === null ? 'album_id IS NULL' : 'album_id = $1'}`,
      albumId === null ? [] : [albumId],
    );
    return rows[0].next;
  }

  async createItem(data) {
    const { rows } = await pool.query(
      `INSERT INTO gallery_items (title, image, link, sort_order, album_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.title,
        data.image,
        data.link?.trim() ? data.link : null,
        data.sort_order ?? 0,
        data.album_id ?? null,
      ],
    );
    return this.findItemById(rows[0].id);
  }

  async updateItem(id, data) {
    const fields = ['title', 'image', 'link', 'sort_order', 'album_id'];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (data[f] === undefined) continue;
      if (f === 'album_id') {
        params.push(data[f] ?? null);
      } else {
        params.push(data[f] ?? null);
      }
      sets.push(`${f} = $${params.length}`);
    }
    if (sets.length === 0) return this.findItemById(id);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE gallery_items SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING id`,
      params,
    );
    return rows[0] ? this.findItemById(rows[0].id) : null;
  }

  async removeItem(id) {
    const { rows } = await pool.query('DELETE FROM gallery_items WHERE id = $1 RETURNING id', [id]);
    return rows[0] ? true : false;
  }
}
