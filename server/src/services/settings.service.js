import { SettingsRepository } from '../repositories/settings.repository.js';

const ALLOWED_GROUPS = ['general', 'home'];

export class SettingsService {
  constructor(repo = new SettingsRepository()) {
    this.repo = repo;
  }

  async getPublicSettings() {
    const all = await this.repo.getAll();
    const result = {};
    for (const row of all) result[row.key] = row.value;
    return {
      general: result.general ?? {},
      home: result.home ?? {},
    };
  }

  async getGroup(key) {
    const group = await this.repo.getGroup(key);
    return group ?? {};
  }

  async updateGroup(key, value) {
    if (!ALLOWED_GROUPS.includes(key)) {
      const error = new Error(`Group "${key}" is not editable.`);
      error.status = 400;
      throw error;
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      const error = new Error('الإعدادات يجب أن تكون كائنات.');
      error.status = 400;
      throw error;
    }
    return this.repo.upsert(key, value);
  }
}