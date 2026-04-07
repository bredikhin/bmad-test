---
artifact: ux-design
project: bmad-test
source: prd.md
date: 2026-04-07
---

## UX Goals

- Zero onboarding: first-time users immediately understand how to add, complete, and delete a todo.
- Status at a glance: completed vs active is obvious without reading full text.
- Fast-feeling interactions: clear acknowledgement on action, no silent failures.
- Polished states: loading, empty, and error states are explicit and stable.
- Responsive: core flows usable at 320px width through desktop.

## Information Architecture

- Single primary page: **Todo List**
- No settings, no accounts, no secondary pages in MVP.

## Primary Screen: Todo List

### Layout (desktop and mobile)

- **Header**
  - Title: “Todos”
  - Optional subtitle: small text “Stored on this device/session” is **NOT** required; avoid implying multi-user security.
- **Add Todo**
  - Single-line text input with placeholder: “Add a task…”
  - Primary action button: “Add”
  - Enter key submits.
  - Add disabled when input is empty/whitespace.
- **List**
  - Active and completed items can be:
    - (Option A) a single list with completed styling, or
    - (Option B) two sections: Active first, Completed second.
  - Must be deterministic; MVP default:
    - Active ordered by createdAt descending
    - Completed ordered by completedAt (or updatedAt) descending if available; otherwise createdAt descending

### Todo Item Row

Each row includes:
- Completion toggle (checkbox)
- Description text
- Created timestamp (compact, e.g. “Apr 7, 11:40” or relative “2h ago”)
- Delete action (trash icon button or text “Delete”)

#### Visual distinction rules

- Active todo:
  - Normal text weight
  - Checkbox unchecked
- Completed todo:
  - Checkbox checked
  - Description uses strike-through and reduced opacity (but not too low contrast)
  - Optional: row background tint
- Do not rely on color alone; combine checkbox + typographic change.

#### Interaction rules

- Toggle completion:
  - Optimistic UI allowed only if the UI clearly reverts on failure.
  - Minimum requirement: disable the checkbox while the request is pending and show subtle inline spinner or row “saving” state.
- Delete:
  - One-step delete (no confirmation) for MVP.
  - While pending: disable delete and show “Deleting…” affordance.

### Loading State

When initial list fetch is in flight:
- Show “Loading todos…” text and/or skeleton rows (3–5 placeholders).
- Add input can be disabled until load completes, or enabled if creation endpoint is available; MVP default: **disable until initial load completes** for simplest consistency.

### Empty State

When list is empty:
- Message: “No todos yet.”
- Secondary: “Add your first task above.”
- Keep the add input visible (it is the primary CTA).

### Error State (initial load)

If initial load fails:
- Preserve page structure (header + add area).
- Show an inline banner:
  - Title: “Couldn’t load your todos”
  - Body: short reason if safe (network error vs server error)
  - Action: “Retry”
- Do not show a blank page.

### Error State (mutations: add/toggle/delete)

If a mutation fails:
- Keep prior list visible.
- Show a banner or per-row inline error (MVP default: **banner** to keep UI simple):
  - “Couldn’t save changes. Retry.”
  - “Retry” repeats the same request payload once.
- If optimistic updates were applied, revert and explain.

## Responsiveness Rules

- At ≤480px:
  - Todo row becomes two lines:
    - Line 1: checkbox + description
    - Line 2: timestamp + delete button aligned to ends
- Touch targets:
  - Checkbox and delete buttons have at least 44×44px hit area.
- Avoid hover-only affordances; all actions must be visible on touch.

## Accessibility Notes (MVP Target: WCAG 2.1 A)

- Input has an explicit label (can be visually hidden but accessible).
- Buttons have accessible names (“Delete todo: {description}”).
- Checkbox is keyboard togglable.
- Focus ring is visible; no focus trapping.
- Completed styling does not reduce contrast below readable levels.

## Copy / Microcopy (MVP)

- Header: “Todos”
- Add placeholder: “Add a task…”
- Add button: “Add”
- Empty: “No todos yet.” / “Add your first task above.”
- Load error: “Couldn’t load your todos.” / “Retry”
- Mutation error: “Couldn’t save changes.” / “Retry”

## Analytics / Telemetry

None required for MVP.

