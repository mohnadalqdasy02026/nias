import { StatusRepository } from '../repositories/status.repository.js';

export class StatusService {
  constructor(repo = new StatusRepository()) {
    this.repo = repo;
  }

  async getHealth() {
    return this.repo.health();
  }

  async getDbStatus() {
    try {
      const row = await this.repo.checkDb();
      return { database: 'connected', serverTime: row.time, pgVersion: row.version.split(' ')[0] ?? row.version };
    } catch {
      return { database: 'disconnected' };
    }
  }
}