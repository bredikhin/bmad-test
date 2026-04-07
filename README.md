# bmad-test — Todo app (MVP)

Full-stack todo list from `_bmad-output/planning-artifacts/prd.md`: **Vite + React** UI, **Express + SQLite** API, no auth (single anonymous scope per deployment).

## Prerequisites

- Node.js **20+** (uses `node --watch` for the API in dev)

## Setup

```bash
npm install
```

## Development

Terminal 1 — API (port **3001**):

```bash
npm run dev:api
```

Terminal 2 — web (port **5173**, proxies `/api`):

```bash
npm run dev:web
```

Or both:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` | API port |
| `DATABASE_PATH` | `apps/api/data/app.db` | SQLite file |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin |

## Production notes

- Use **HTTPS** in front of the API in real deployments.
- This MVP is **not** multi-tenant safe: all clients share one todo list for that backend instance.

## Planning artifacts

- PRD: `_bmad-output/planning-artifacts/prd.md`
- UX: `_bmad-output/planning-artifacts/ux-design.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Epics: `_bmad-output/planning-artifacts/epics-and-stories.md`

## Build

```bash
npm run build -w web
```

The API runs from source with `node` (no separate build step).
