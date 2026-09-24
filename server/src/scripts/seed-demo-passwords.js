#!/usr/bin/env node
// Demo password bootstrap
// Usage: node server/src/scripts/seed-demo-passwords.js
// Sets real bcrypt hashes for demo accounts created by migration 002.
import pg from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://nias:nias@localhost:5432/nias';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@12345';

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const { rowCount } = await client.query(
      "UPDATE users SET password_hash = $1 WHERE email LIKE '%@nias-academy.demo'",
      [hash],
    );
    console.log(`Updated ${rowCount} demo user(s). Password: ${DEMO_PASSWORD}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});