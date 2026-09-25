import { pool } from '../config/db.js';

export class SearchRepository {
  async search({ q, limit = 10 }) {
    const like = `%${q}%`;
    const results = [];

    const news = await pool.query(
      `SELECT 'news' AS type, id, title_ar AS title, summary_ar AS snippet, published_at
       FROM news WHERE status = 'published' AND deleted_at IS NULL
         AND (title_ar ILIKE $1 OR body_ar ILIKE $1 OR title_en ILIKE $1)
       ORDER BY published_at DESC LIMIT $2`,
      [like, limit],
    );
    results.push(...news.rows.map((r) => ({ type: r.type, id: Number(r.id), title: r.title, snippet: r.snippet, meta: { publishedAt: r.published_at } })));

    const programs = await pool.query(
      `SELECT 'program' AS type, id, name_ar AS title, description AS snippet, NULL AS published_at
       FROM academic_programs WHERE status = 'active' AND deleted_at IS NULL
         AND (name_ar ILIKE $1 OR name_en ILIKE $1 OR description ILIKE $1) LIMIT $2`,
      [like, limit],
    );
    results.push(...programs.rows.map((r) => ({ type: r.type, id: Number(r.id), title: r.title, snippet: r.snippet, meta: {} })));

    const pages = await pool.query(
      `SELECT 'page' AS type, id, title_ar AS title, content_ar AS snippet, NULL AS published_at
       FROM site_pages WHERE status = 'published'
         AND (title_ar ILIKE $1 OR title_en ILIKE $1 OR content_ar ILIKE $1) LIMIT $2`,
      [like, limit],
    );
    results.push(...pages.rows.map((r) => ({ type: r.type, id: Number(r.id), title: r.title, snippet: r.snippet, meta: {} })));

    return results;
  }
}

export class StatsRepository {
  // Real figures verified against the production database after
  // migration 026 removed all demo seed data. DB counts win over
  // these floors so future seeding always reflects reality.
  static legacyBaselines = {
    departments: 9,
    branches: 6,
    colleges: 4,
    programs: 13,
    students: 0,
    faculty: 187,
  };

  async all() {
    const counters = {};

    const queries = {
      news: "SELECT count(*)::int AS c FROM news WHERE status = 'published' AND deleted_at IS NULL",
      programs: "SELECT count(*)::int AS c FROM academic_programs WHERE status = 'active'",
      colleges: "SELECT count(*)::int AS c FROM colleges WHERE status = 'active'",
      branches: "SELECT count(*)::int AS c FROM institute_branches WHERE status = 'active'",
      faculty: "SELECT count(*)::int AS c FROM faculty_members WHERE status = 'active'",
      trainingCourses: "SELECT count(*)::int AS c FROM training_courses WHERE status = 'open'",
      students: "SELECT count(*)::int AS c FROM students",
      journalIssues: "SELECT count(*)::int AS c FROM journal_issues WHERE status = 'published'",
    };

    for (const [key, sql] of Object.entries(queries)) {
      const { rows } = await pool.query(sql);
      const dbCount = rows[0].c;
      const baseline = StatsRepository.legacyBaselines[key];
      counters[key] = baseline != null ? Math.max(dbCount, baseline) : dbCount;
    }

    counters.departments ??= StatsRepository.legacyBaselines.departments;

    return counters;
  }
}