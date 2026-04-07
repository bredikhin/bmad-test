---
artifact: sprint-plan
project: bmad-test
date: 2026-04-07
---

## Order of execution

1. **E1** — Foundations (workspaces, API skeleton, DB migrate)
2. **E2** — Todo API (repository, routes, validation)
3. **E3** — Web client (Vite React, UI states, API wiring)
4. **E4** — README + gitignore + smoke run

## Definition of Done (MVP)

- `npm install` at repo root succeeds
- `npm run dev` starts API and web (or documented two-terminal workflow)
- User can CRUD todos; reload persists data
- No raw SQL in HTTP route handlers
