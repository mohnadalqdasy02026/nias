import { nanoid } from 'nanoid';
import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB decoded

export class MediaService {
  constructor(repository) {
    this.repository = repository;
  }

  uploadRoot() {
    return path.resolve(process.cwd(), env.UPLOAD_DIR);
  }

  toPublicUrl(item) {
    return { ...item, url: `/uploads/${item.file_path}` };
  }

  async list(filters) {
    const result = await this.repository.list(filters);
    return { ...result, items: result.items.map((it) => this.toPublicUrl(it)) };
  }

  async upload({ file_name, mime_type, data_base64, alt_text }, userId) {
    if (!MIME_EXT[mime_type]) {
      throw AppError.unprocessable('Unsupported file type');
    }

    let buffer;
    try {
      buffer = Buffer.from(data_base64, 'base64');
    } catch {
      throw AppError.unprocessable('Invalid file data');
    }

    if (buffer.length === 0) throw AppError.unprocessable('File is empty');
    if (buffer.length > MAX_FILE_SIZE) {
      throw AppError.badRequest('File exceeds 8 MB limit');
    }

    const storedName = `${nanoid(20)}${MIME_EXT[mime_type]}`;
    const root = this.uploadRoot();
    await fs.mkdir(root, { recursive: true });
    await fs.writeFile(path.join(root, storedName), buffer);

    const saved = await this.repository.create({
      file_name: file_name || storedName,
      file_path: storedName,
      file_type: mime_type,
      file_size: buffer.length,
      alt_text: alt_text ?? null,
      uploaded_by: userId,
    });

    return this.toPublicUrl(saved);
  }

  async update(id, data) {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Media record not found');
    const saved = await this.repository.update(id, {
      alt_text: data.alt_text,
      file_name: data.file_name,
    });
    return this.toPublicUrl(saved);
  }

  async remove(id) {
    const existing = await this.repository.delete(id);
    if (!existing) throw AppError.notFound('Media record not found');
    const absolute = path.join(this.uploadRoot(), existing.file_path);
    await fs.unlink(absolute).catch(() => {});
    return existing;
  }
}