---
artifact: epics-and-stories
project: bmad-test
source: prd.md, ux-design.md, architecture.md
date: 2026-04-07
---

## Epic E1 — Foundations

| ID | Story | AC (summary) |
|----|--------|--------------|
| E1-S1 | Monorepo layout | Root `package.json` workspaces; `apps/api`, `apps/web`; root README run instructions |
| E1-S2 | API boot + health | Server listens on `PORT`; `GET /api/health` returns 200 |
| E1-S3 | SQLite + migrate | `CREATE TABLE IF NOT EXISTS todos`; file path from `DATABASE_PATH` |

## Epic E2 — Todo API

| ID | Story | AC (summary) |
|----|--------|--------------|
| E2-S1 | List todos | `GET /api/todos` returns array; persisted rows survive restart |
| E2-S2 | Create todo | `POST /api/todos` validates non-empty title; 201 + body |
| E2-S3 | Toggle complete | `PATCH /api/todos/:id` updates `completed`, bumps `updated_at` |
| E2-S4 | Delete todo | `DELETE /api/todos/:id` 204; 404 if missing |
| E2-S5 | Repository boundary | No raw SQL in route file; domain validate title length |

## Epic E3 — Web client

| ID | Story | AC (summary) |
|----|--------|--------------|
| E3-S1 | Shell + fetch | Load list on mount; loading state |
| E3-S2 | Add todo | Input + Add; Enter submits; disabled when empty |
| E3-S3 | Toggle + delete | Checkbox + delete; pending/disabled during request |
| E3-S4 | Empty + errors | Empty state; load error with Retry; mutation error with Retry |
| E3-S5 | Ordering + styling | Active then completed; completed visually distinct; responsive |

## Epic E4 — Polish & docs

| ID | Story | AC (summary) |
|----|--------|--------------|
| E4-S1 | README | Dev commands, env vars, limitations (no auth) |
| E4-S2 | `.gitignore` | `node_modules`, `dist`, `*.db` |

### FR Coverage Map (MVP)

- FR1–FR21: E2 + E3
- NFR-P/R/S/M (baseline): architecture + E1–E2 headers/CORS/limits
