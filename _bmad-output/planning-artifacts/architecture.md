---
artifact: architecture
project: bmad-test
source: prd.md, ux-design.md
date: 2026-04-07
---

## Overview

**Pattern:** small **REST API** + **SPA** over HTTP. **SQLite** for durable, single-binary persistence on one machine or container. **Repository boundary** keeps HTTP handlers free of SQL so **per-user/partition** can replace global queries later.

## Runtime Topology

| Component | Role | Default |
|-----------|------|---------|
| `apps/web` | Static SPA + dev server | Vite dev `:5173`; build → static assets |
| `apps/api` | HTTP JSON API | Node `:3001` |
| SQLite file | Durable store | `apps/api/data/app.db` (override with `DATABASE_PATH`) |

**Production default:** serve SPA from CDN/Caddy/nginx or API `static` mount (not required for MVP local proof; README documents dual-service dev).

## API Contract (v1)

Base path: `/api` (version prefix reserved: `/api/v1` later if needed).

### `GET /api/todos`

Returns all todos for the **current anonymous tenant** (single global scope in MVP).

**Response 200:**

```json
{
  "todos": [
    {
      "id": "uuid",
      "title": "string",
      "completed": false,
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

**Sort:** Server returns rows; **client** applies UX ordering (active by `createdAt` desc, then completed by `updatedAt` desc). Alternatively server sorts—either is valid; implementation sorts on server for single source of truth.

### `POST /api/todos`

**Body:**

```json
{ "title": "trimmed non-empty string" }
```

**Response 201:** `{ "todo": { ... } }`

**Errors:** `400` validation, `500` server.

### `PATCH /api/todos/:id`

**Body:**

```json
{ "completed": true }
```

**Response 200:** `{ "todo": { ... } }`

**Errors:** `404`, `400`, `500`.

### `DELETE /api/todos/:id`

**Response 204** empty body.

**Errors:** `404`, `500`.

### Errors (JSON)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "human readable" } }
```

No stack traces in response body.

## Data Model

**Table `todos`:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `title` | TEXT NOT NULL | Max length enforced in domain layer (e.g. 500) |
| `completed` | INTEGER NOT NULL | 0/1 |
| `created_at` | TEXT NOT NULL | ISO-8601 UTC |
| `updated_at` | TEXT NOT NULL | ISO-8601 UTC; bumped on create and patch |

**Indexes:** optional `INDEX(completed, updated_at)` for scale; not required for MVP row counts.

## Layering (NFR-M1)

| Layer | Responsibility |
|-------|----------------|
| **HTTP** | Parse body, map status codes, no business rules beyond shape |
| **Service** (optional thin) | Orchestrate repo calls |
| **Repository** | `listTodos`, `createTodo`, `updateCompleted`, `deleteTodo` — all SQL here |
| **Domain** | `validateTitle(title)` |

**Future auth:** inject `req.ctx = { userId }` from middleware; repository methods accept `ctx` and add `WHERE owner_id = ?`.

## Security & Headers (NFR-S2)

- `helmet` (or manual): minimal security headers on API.
- JSON body limit **64kb**.
- CORS: dev allows `http://localhost:5173`; prod configurable via `CORS_ORIGIN`.
- **Threat model (NFR-S3):** MVP is **shared anonymized list** per deployment; not safe for hostile multi-tenant public internet without auth.

## Performance

- Single-node SQLite with WAL mode optional.
- Targets from PRD: keep handler + DB under **200ms p95** for mutations on small sets (local dev verification).

## Deployment / Dev

- **Env:** `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `NODE_ENV`.
- **Migrations:** `apps/api/src/migrate.js` runs on boot (idempotent `CREATE TABLE IF NOT EXISTS`).

## Testing Strategy (defaults)

- **API:** one integration script or `node --test` hitting in-memory/http—optional post-MVP.
- **Manual smoke:** curl or browser checklist in README.

## Traceability

| PRD | Architecture |
|-----|----------------|
| FR1–FR5, FR18–FR19 | REST + schema |
| FR16–FR17 | SQLite durability + transactional updates |
| NFR-M1 | Repository + future `userId` |
| UX ordering | `updated_at` on toggle + sort rules |
