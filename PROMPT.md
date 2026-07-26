# Claude Code Kickoff Prompt — Payments Dashboard

> Copy everything between the `---` markers into Claude Code as your first message,
> from the root of an empty repo that already contains `CLAUDE.md`, `specs/`, and `.claude/skills/`.

---

You are the implementing engineer on a **spec-driven** delivery. The specification is the
source of truth, not this prompt. Your job is to turn `specs/` into a running,
Railway-deployed application with full requirement traceability.

**Before writing any code, read in this order:**

1. `CLAUDE.md` — project conventions and guardrails
2. `specs/SPEC-001-payment-dashboard.md` — functional and non-functional requirements (FR-*/NFR-*)
3. `specs/openapi.yaml` — the API contract; this is binding
4. `specs/acceptance-criteria.md` — the AC-* scenarios you must satisfy
5. `specs/ADR-001-architecture.md` — decisions already made; do not relitigate them

Then load these skills and follow them: `spec-driven-delivery`, `typed-contract-first`,
`railway-single-service-deploy`, `submission-review`.

## Phase 0 — Plan (do this and stop)

Produce a build plan containing:

- The file tree you intend to create, with a one-line purpose for each file
- A traceability table mapping every **FR-*** to the file(s) that will satisfy it
- Any ambiguity you found in the specs, with the assumption you propose to make
- Anything in the specs you believe is over-engineered for a 2-hour timebox

**Do not write code yet.** Wait for my approval of the plan.

## Phase 1 — Contracts

Implement `packages/contracts` first: the Zod schemas and the TypeScript types inferred
from them, matching `specs/openapi.yaml` exactly. Both the API and the web app import
from here. No type is redefined anywhere else in the repo.

## Phase 2 — API

Implement `apps/api` (NestJS + TypeScript):

- `GET /api/payments` with optional `status` query param, validated against the contract
- `GET /api/health` returning `{ status: "ok" }`
- Layered structure: controller → service → repository (in-memory), no logic in the controller
- A global exception filter emitting RFC 9457 `application/problem+json` errors
- Seed data: 12 payments spanning all three statuses, mixed currencies, dates over ~30 days

Write the unit test for the filter logic before the service implementation.

## Phase 3 — Web

Implement `apps/web` (React 19 + TypeScript + Vite):

- A `usePayments(status)` hook owning fetch, loading, error, and abort-on-change
- An explicit view state union — `loading | error | empty | ready` — rendered exhaustively.
  A ternary between "spinner" and "table" is not acceptable.
- A payments table and a status filter control (All / Pending / Approved / Rejected)
- Amounts formatted with `Intl.NumberFormat` from minor units; dates with `Intl.DateTimeFormat`
- A retry action on the error state
- Clean, readable, accessible markup. No component library, no CSS framework. Plain CSS modules.

## Phase 4 — Deploy

Follow the `railway-single-service-deploy` skill exactly. One Railway service, one URL:
the Nest app serves the built SPA and the API from the same origin. Add `railway.json`,
the root build/start scripts, and the health check. Then tell me the exact commands to run.

## Phase 5 — Submission

Follow the `submission-review` skill. Generate `README.md` from the template, including
the assumptions and trade-offs note the task asks for, and the completed traceability matrix.
Then run the self-review checklist and report the results honestly — including anything
you did not finish.

## Standing rules

- **Timebox discipline beats completeness.** If something is not in the specs, do not build it.
  No auth, no database, no pagination, no dark mode, no charts.
- If a spec and this prompt disagree, the spec wins — and tell me about the conflict.
- Never mark a requirement as done without the code path and test that proves it.
- Prefer 20 lines of obvious code over 5 lines of clever code. A reviewer reads this in 10 minutes.
- Commit in small, labelled steps: `feat(api): FR-2 status filtering`.

Start with Phase 0.

---

## Optional follow-up prompts

**After the build, to stress-test it:**

> Act as the hiring reviewer. You have 10 minutes and you are skeptical. Read the repo cold
> and list, in priority order, everything that would cost me points — naming, structure,
> error handling, test value, README clarity. Do not fix anything yet, and do not be kind.

**To generate the interview talk-track:**

> Write me a 90-second walkthrough of this codebase for a technical interviewer with a
> regulated-finance background: the three decisions I would defend, why minor-unit integers
> matter for money, and how the spec-to-code traceability worked. Plain speech, no bullet points.
