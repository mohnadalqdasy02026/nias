#!/usr/bin/env node
// NIAS migrations runner
// Usage:
//   node server/src/scripts/migrate.js up            # apply all pending
//   node server/src/scripts/migrate.js up 1          # apply up to N pending
//   node server/src/scripts/migrate.js down          # rollback last migration
//   node server/src/scripts/migrate.js down 2        # rollback last N
//   node server/src/scripts/migrate.js status        # show state
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MIGRATIONS_DIR = path.resolve(__dirname, '../../../database/migrations');
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || DEFAULT_MIGRATIONS_DIR;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://nias:nias@localhost:5432/nias';

const [cmd = 'status', countArg] = process.argv.slice(2);
const count = countArg === undefined ? Infinity : Math.max(0, parseInt(countArg, 10) || 0);

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        file_name  TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
    const ups = files.filter((f) => /\.up\.sql$/.test(f));
    const downs = files.filter((f) => /\.down\.sql$/.test(f));

    const { rows: applied } = await client.query('SELECT version FROM schema_migrations');
    const appliedSet = new Set(applied.map((r) => r.version));

    if (cmd === 'status') {
      console.log('Migrations dir:', MIGRATIONS_DIR);
      for (const up of ups) {
        const version = versionOf(up);
        console.log(`${appliedSet.has(version) ? ' [x]' : ' [ ]'} ${up}`);
      }
      return;
    }

    if (cmd === 'up') {
      const pending = ups.filter((f) => !appliedSet.has(versionOf(f))).slice(0, count);
      let n = 0;
      for (const file of pending) {
        await runFile(client, file, 'up');
        await client.query('INSERT INTO schema_migrations (version, file_name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [versionOf(file), file]);
        console.log(`applied  ${file}`);
        n++;
      }
      console.log(n > 0 ? `${n} migration(s) applied` : 'nothing to apply');
      return;
    }

    if (cmd === 'down') {
      const rollback = downs
        .filter((f) => {
          const v = versionOf(f);
          return appliedSet.has(v);
        })
        .reverse()
        .slice(0, count);
      let n = 0;
      for (const file of rollback) {
        await runFile(client, file, 'down');
        await client.query('DELETE FROM schema_migrations WHERE version = $1', [versionOf(file)]);
        console.log(`rolled  back ${file}`);
        n++;
      }
      console.log(n > 0 ? `${n} migration(s) rolled back` : 'nothing to roll back');
      return;
    }

    throw new Error(`unknown command: ${cmd}`);
  } finally {
    await client.end();
  }
}

function versionOf(file) {
  return file.replace(/\.(up|down)\.sql$/, '');
}

async function runFile(client, file, direction) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`FAILED ${file} (${direction}):`, err.message);
    process.exitCode = 1;
    throw err;
  }
}

main().catch((err) => {
  console.error('migrate error:', err.message);
  process.exit(1);
});