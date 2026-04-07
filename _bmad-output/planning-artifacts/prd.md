---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - User-provided Todo App PRD brief (chat)
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: web_app
  domain: general_productivity
  complexity: low
  projectContext: greenfield
workflowType: prd
---

# Product Requirements Document — bmad-test

**Author:** Russ  
**Date:** 2026-04-07

## Executive Summary

Deliver a **full-stack personal todo product** that lets an individual manage tasks with **minimal surface area**: create, view, complete/uncomplete, and delete items; **server-backed persistence**; and a **responsive web UI** that feels immediate and legible on phone and desktop. Success is **self-explanatory usage** (no onboarding), **stable data across reloads and sessions**, and an implementation that stays **simple to deploy, understand, and extend** toward authentication and multi-user data later without a full rewrite.

### What Makes This Special

**Radical simplicity as the product**: fewer features than commodity competitors, but a **complete** core loop, **clear status at a glance**, and **polished empty, loading, and error states**. Technical positioning emphasizes **clean boundaries** (client vs server, persistence vs presentation) so **future identity and tenancy** can attach without abandoning the v1 design.

## Project Classification

| Dimension | Value |
|-----------|--------|
| Project type | Web application (responsive SPA or multi-page web client served by the same product) with server-mediated persistence |
| Domain | General productivity / personal task management |
| Domain complexity | Low (no sector-specific compliance in MVP) |
| Project context | Greenfield |

## Success Criteria

### User Success

- A first-time user **adds, completes, and deletes** todos **without help text or tours**, on **mobile-width and desktop-width** layouts.
- After actions that the server accepts, the user **observes the updated list within one second** under typical local or broadband latency (qualifier for “instant” feel).
- After closing and reopening the app (new session), **previously stored todos still appear** with correct description, completion flag, and creation time.
- On failure (network or server), the user **always gets readable feedback** and **never loses the whole list** to a blank error surface unless data is truly unavailable.

### Business Success

- V1 ships as a **coherent product**: core loop works end-to-end in a **single deployment** (build + run documented for contributors).
- Scope stays **bounded**: no accounts, sharing, priorities, due dates, or notifications in MVP, reducing delivery risk.
- Codebase remains **approachable** for a new developer: bounded modules, obvious run path, and a **small HTTP surface** for todos.

### Technical Success

- **CRUD persistence** is **durable** across process restarts for the configured store (no “memory-only” production path unless explicitly labeled non-production).
- **Client and server both handle errors** without unhandled exceptions surfacing as raw stack traces to end users.
- Architecture keeps a **seam** where **authentication and per-user partitions** can be added later (data access and routing not hard-coded to anonymous global tables without an abstraction point).

### Measurable Outcomes

| Outcome | Target | Verification |
|---------|--------|----------------|
| Core task completion without guidance | ≥90% of test participants in a 3-task usability probe complete all tasks unaided | Moderated or unmoderated usability test with 5+ participants |
| Post-mutation UI sync | Median time from confirmed server success to visible list update ≤500 ms on localhost; ≤1 s on typical broadband | Instrumented E2E or manual timing sample (n≥20 actions) |
| Session survivability | 100% of created todos reappear after full page reload in acceptance tests | Automated E2E |
| Error visibility | 0 silent failures for create/update/delete in E2E fault injection suite | Automated tests with faulting API |

## Product Scope

### MVP — Minimum Viable Product

- **Todo model**: short text description, boolean (or equivalent) completion state, **creation timestamp**.
- **User actions**: create, list, toggle completion (both directions), delete.
- **Client**: responsive layout; **loading**, **empty**, and **error** states; **visual distinction** for completed vs active todos; updates after mutations without manual full reload.
- **Server**: **HTTP API** implementing CRUD for todos; **durable storage**; consistent reads after successful writes.
- **Explicit non-goals for MVP**: user accounts, multi-user isolation, collaboration, priorities, deadlines, notifications, native mobile apps.

### Growth Features (Post-MVP)

- User **accounts**, **per-user data**, optional **OAuth** or passwordless flows.
- **Task metadata**: priorities, tags, due dates, notes.
- **Offline-first or optimistic UI** beyond basic retry messaging.
- **Sharing / collaboration** or **team** workspaces.

### Vision (Future)

- Notifications, calendar integration, cross-device sync with conflict resolution, automation hooks (integrations), admin/operator dashboards if the product becomes multi-tenant.

## User Journeys

### Journey 1 — Alex: same-day clarity (happy path)

Alex opens the app on a phone during a commute. The list loads empty with a **clear empty state** and a single obvious way to add a task. They add “Buy milk”, see it appear **immediately**, then add two more errands. At the store they mark “Buy milk” **complete** and see it **visually move to a completed appearance** (or equivalent grouping/styling). **No tutorial** appears. **Outcome:** three items managed, one completed, zero confusion.

### Journey 2 — Alex: bad signal (error + recovery)

On weak LTE, Alex tries to add a task. The request **fails**. The UI shows a **short error** and leaves prior items intact. They tap **retry** (or the control remains available) when signal improves; the item **appears after success**. **Outcome:** failure did not corrupt mental model or data already shown.

### Journey 3 — Alex: new browser session (persistence)

Next morning on a laptop, Alex opens the same deployment URL. While loading, they see a **loading state**. The list then shows **yesterday’s remaining and completed items** with correct text and timestamps. They **delete** an obsolete task; reload confirms it stayed deleted. **Outcome:** trust that the app is a **system of record** for personal tasks.

### Journey 4 — Morgan: desktop batch tidy (mixed operations)

Morgan clears several completed housekeeping items from a week of chores using a mouse and keyboard on a wide viewport, toggling a mistakenly completed item back to active, then deleting noise tasks. Layout remains usable **without horizontal scrolling** for core controls. **Outcome:** bulk housekeeping feels **fast** and **legible**.

### Journey Requirements Summary

- **Single-list** presentation with **creation time** surfaced.
- **Immediate** list reconciliation after successful mutations.
- **Completion styling** distinct from active items.
- **Empty**, **loading**, and **recoverable error** paths.
- **Responsive** layouts for narrow and wide viewports.
- **Server persistence** observable across reloads and devices hitting the same backend state (still a **single logical user** in MVP).

## Domain-Specific Requirements

**Not applicable for MVP.** Domain classification is **general software** with **low regulatory complexity**. No HIPAA, PCI, FedRAMP, or financial compliance mandates are in scope. If future versions store **PII** or cross-border data, add a privacy and retention section in a PRD revision before implementation.

## Innovation & Novel Patterns

**No breakthrough or novel interaction model is required.** The product wins on **reliability, clarity, and implementation hygiene**. Competitive differentiation is **scope discipline** and **extensibility seams**, not an unexplored UX paradigm.

## Web Application Specific Requirements

### Project-Type Overview

The product is a **browser-based client** backed by a **small HTTP API**. Primary constraints from the `web_app` profile: **responsive behavior**, **client-side performance targets**, **sane SEO posture** (even if most interaction is private), and **baseline accessibility**.

### Browser and Platform Matrix

| Environment | Requirement |
|-------------|-------------|
| Desktop | Latest two major versions of Chromium, Firefox, and Safari |
| Mobile | Latest two major versions of Mobile Safari (iOS) and Chrome (Android) |
| Viewports | Core flows usable from **320px** width up to large desktop |

### Responsive Design

- **Core task flows** (create, complete, delete, scan list) **do not require horizontal scrolling** at MVP breakpoints.
- Touch targets on mobile meet **minimum 44×44px** where platform guidelines apply (measurable in design review).

### Performance Targets (UX-facing)

- **First meaningful list paint** (skeleton or list) within **2.0 s** on simulated **Fast 3G** for a cold load of under **50 todos** in acceptance testing.
- **Interaction response**: primary controls provide **acknowledgement** (disabled state, spinner, or optimistic placeholder) within **100 ms** of user action under normal conditions.

### SEO Strategy

- Public marketing or landing page **may** exist later; MVP **may** ship as a single-page app with **no public index requirement**. If exposed publicly, provide **basic metadata** (title, description) and avoid fragment-only URLs without server fallback for shareable pages.

### Accessibility Level

Target **WCAG 2.1 Level A** minimum for MVP controls (labels, focus order, non-color-only status). **Level AA** is a **post-MVP stretch** unless a stakeholder mandates it earlier.

### Technical Architecture Considerations

- **Separation of concerns**: UI composition separate from **HTTP client** and from **domain rules** for todo validation (e.g., non-empty description policy decided in one layer).
- **API stability**: Version or namespace HTTP paths so a **v2** can add auth without breaking **v1** mobile caches aggressively.
- **State management**: After HTTP 2xx on mutations, client state reconciles with server truth (optimistic updates allowed if reconciled on failure).

### Implementation Considerations

- **Deployment story**: one command or documented compose file to run **web + API + database** (or embedded store) for local dev; production path documented separately.
- **Logging**: server logs request id, route, and outcome for **5xx** errors without logging full todo body if descriptions may become sensitive later.

## Project Scoping & Phased Development

### MVP Strategy and Philosophy

**Problem-solving MVP**: ship the **smallest reliable loop** that replaces ad-hoc notes for one user on one deployment. **Platform MVP** hygiene: **extensibility hooks** for identity even if unused.

### MVP Feature Set (Phase 1)

**Core journeys supported:** Journeys 1–4 (happy path, error recovery, persistence, desktop tidy).

**Must-have capabilities:** match **Functional Requirements** sections **Todo lifecycle**, **List presentation and status**, **Cross-session persistence**, **Experience states**, **Layout and modalities**, **Server-mediated consistency**; **MVP boundaries** FR.

### Post-MVP Features

**Phase 2 (Growth):** accounts, per-user isolation, richer metadata (tags, due dates), improved offline/optimistic strategies, stronger accessibility.

**Phase 3 (Expansion):** collaboration, notifications, integrations, admin/multi-tenant tooling.

### Risk Mitigation Strategy

| Risk | Mitigation |
|------|------------|
| Scope creep into collaboration | Keep **PRD exclusions** visible in sprint reviews; file new ideas in backlog with **phase tags** |
| “Instant” feel not met | Define **measurable UI sync** targets early; add **E2E timing** hooks |
| Persistence bugs | **Property-style tests** or E2E around reload consistency |
| Future auth retrofit painful | Introduce **repository boundary** and **user context stub** in server early |

## Functional Requirements

Capability contract for UX, architecture, and epics. Wording is **implementation-agnostic** unless noted as **MVP boundary**.

### Todo Lifecycle

- **FR1:** Users can create a todo with a short text description.
- **FR2:** Users can delete an existing todo.
- **FR3:** Users can mark a todo as completed.
- **FR4:** Users can mark a completed todo as not completed.
- **FR5:** Users can observe a **creation timestamp** for each todo where the list is shown.

### List Presentation and Status

- **FR6:** Users can view **all todos in a single list** immediately after opening the application (after initial load completes).
- **FR7:** Users can perceive **which todos are completed and which are active** without relying only on reading full description text (visual or structural distinction).
- **FR8:** The list orders todos **deterministically** for a given dataset (ordering rule fixed in UX/design spec, e.g., by creation time).

### Interaction Responsiveness

- **FR9:** After a **successful** create, completion change, or delete, the list the user is viewing **reflects that change** without the user manually issuing a browser reload.
- **FR10:** Users can perform **create, view list, toggle completion, and delete** without **onboarding flows, tours, or mandatory help content**.

### Experience States

- **FR11:** Users see an explicit **loading** indicator while initial todo data is being fetched.
- **FR12:** Users see a dedicated **empty** state when there are zero todos.
- **FR13:** When an action fails, users see a **clear error message** instead of a silent no-op.
- **FR14:** When failure is **transient**, users can **retry** the action without restarting the whole client session.

### Layout and Modalities

- **FR15:** Users can complete core flows on **narrow mobile** and **wide desktop** viewports **without horizontal scrolling** for primary controls.

### Cross-Session Persistence

- **FR16:** After a successful write, a **full page reload** shows todos consistent with the last successful mutations for the same deployment and usage context.
- **FR17:** The server is the **source of truth** after acknowledged mutations, so **no alternate client cache** permanently contradicts confirmed server state once operations settle.

### Server Capabilities

- **FR18:** The product exposes **HTTP operations** that support **creating, reading, updating completion state, and deleting** todos for use by the shipped web client (additional clients are **out of scope** for MVP but **not prohibited** by the interface shape).
- **FR19:** The HTTP interface is **described in a stable contract** consumable by the web client team without ambiguity (human-readable document or schema agreed in architecture; not mandated as public OpenAPI in PRD).

### MVP Boundaries

- **FR20:** The MVP **does not require** user authentication or separate user accounts.
- **FR21:** The MVP **does not** surface other users’ todos to a visitor (single logical user / shared backend instance acceptable for classroom demos but **not** a multi-user product promise).

## Non-Functional Requirements

### Performance

- **NFR-P1:** For **non-error** mutations (`POST/PATCH/DELETE`) under normal local dev and CI conditions, **server processing time** (excluding client rendering) is **<200 ms at p95** for datasets up to **1,000 todos** in synthetic benchmarks.
- **NFR-P2:** Initial list fetch for **≤50 todos** completes server-side within **300 ms p95** on reference hardware defined in architecture (keeps UX targets achievable).

### Reliability and Durability

- **NFR-R1:** Committed todo writes **survive** API process restarts when using the **documented production persistence** mode (verified in deployment checklist).
- **NFR-R2:** **5xx** rates in monitored environments trigger **alerting hooks** if operations wire metrics (optional for toy deploys, mandatory for named “production” profile).

### Security

- **NFR-S1:** Transport uses **HTTPS** in real deployments; local dev **may** use HTTP with documented risk.
- **NFR-S2:** Standard **HTTP security headers** and **input size limits** are applied server-side to reduce trivial abuse (exact set in architecture).
- **NFR-S3:** Because MVP is **pre-auth**, deployments **must not** be advertised as **multi-tenant secure**; architecture doc states threat model.

### Maintainability and Evolvability

- **NFR-M1:** Introduce a **repository or data-access boundary** isolating persistence from route handlers so **per-user partitioning** can replace global storage later.
- **NFR-M2:** Domain rules (e.g., maximum description length, forbidden empty description) are **centralized** and covered by **automated tests**.

### Accessibility

- **NFR-A1:** Interactive controls for core flows meet **WCAG 2.1 Level A** checkpoints for **name/role**, **keyboard operability**, and **non-color-only status** in audit performed before MVP **release candidate**.

### Integration

- **No mandatory external integrations** for MVP beyond the **web client ↔ server** boundary already covered by FR18–FR19.

---

## Traceability Note

| Theme in source brief | Primary PRD anchors |
|----------------------|---------------------|
| Simplicity and clarity | Executive Summary; MVP Scope; FR10 |
| CRUD + metadata | FR1–FR5, FR18–FR19 |
| Instant updates + visual completion | FR7, FR9; Success Criteria |
| Responsive + states | FR11–FR15; Web App Requirements |
| Durable backend + future auth | FR16–FR18; NFR-M1, Technical Success |
| Excluded advanced features | Product Scope; FR20–FR21 |

---

## Completion and Next Steps

This PRD is **implementation-ready** for architecture and UX workflows. Recommended next passes:

1. **`bmad-create-ux-design`** — patterns for list, completion affordance, empty/loading/error, responsive layout.
2. **`bmad-create-architecture`** — stack-agnostic decisions with explicit extensibility seams for auth and tenancy.
3. **`bmad-validate-prd`** optional quality pass on density and measurability.
4. **`bmad-check-implementation-readiness`** before epic breakdown if UX and architecture drafts exist.
