# NIAS Academy — Website Rebuild

Rebuild of the NIAS Academy (المعهد الوطني للعلوم الإدارية) website.

## Stack

- Backend: Node.js + Express (+ PostgreSQL, node-postgres `pg`)
- Frontend: React + Vite
- Database: PostgreSQL 16 (schema in `database/migrations/`)
- Infra: Docker Compose (`infra/`)

## Structure

```
nias_academy/
├── database/        SQL migrations (001..007) + seed
├── infra/           Docker / nginx / backup
├── docs/            SRS + design docs
├── server/          Express API (workspace)
│   └── src/
│       ├── config/        env loading / DB pool
│       ├── controllers/   HTTP request handlers
│       ├── services/      business logic
│       ├── repositories/  data access
│       ├── models/        schema / row maps
│       ├── routes/        API route definitions
│       ├── middleware/    auth, RBAC, errors, validate
│       ├── validators/    zod schemas
│       ├── utils/         helpers
│       ├── scripts/       migrate, seed
│       ├── app.js         Express app
│       └── server.js      bootstrap
└── web/             React frontend (workspace)
```

## Dev

Requires Node >= 20.

```bash
npm install          # installs all workspaces
npm run dev:server   # API on :3000
npm run dev:web      # Vite on :5173
```

`.env` files: `server/.env` (API) and env vars per `infra/.env.example`.

## Migrations

Run from the `database/` folder (see Step 2 — a Node runner reads
`database/migrations/` in numeric order and records them in
`schema_migrations`).

## Health

`GET /healthz` returns service status (used by Docker HEALTHCHECK).