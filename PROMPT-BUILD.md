# The prompt to paste

Open Claude Code at the repo root and paste everything between the `---` markers.

This supersedes Phases 0–1 of `PROMPT.md` — the contract and seed data already exist, so
Claude has nothing to invent at the boundary.

---

This repo already contains a specification, four skills, and a locked data contract.
Read before you build, then build the rest.

**Read first, in this order:**

1. `CLAUDE.md` — conventions and the do-not-build list
2. `specs/SPEC-001-payment-dashboard.md` — FR-1..FR-12, NFR-1..NFR-8
3. `specs/openapi.yaml` — the binding API contract
4. `specs/acceptance-criteria.md` — AC-1..AC-16
5. `specs/ADR-001-architecture.md` — settled decisions, do not relitigate
6. `packages/contracts/src/payment.ts` — the schemas everything imports
7. `apps/api/src/payments/payments.seed.ts` — the 12 seed payments

Then load and follow these skills: `spec-driven-delivery`, `typed-contract-first`,
`railway-single-service-deploy`, `submission-review`.

**Already written — treat as frozen. Do not edit, do not regenerate, do not duplicate:**

- `package.json` (npm workspaces, build ordering)
- `tsconfig.base.json`, `railway.json`, `.gitignore`, `.env.example`
- `packages/contracts/` — the entire package
- `apps/api/src/payments/payments.seed.ts`

If you believe one of these is wrong, say so and stop. Do not silently change it.

**Build these:**

**A. API — `apps/api` (NestJS 11 + TypeScript)**

- `main.ts`: `app.setGlobalPrefix("api")`, listen on `Number(process.env.PORT) || 3000`
  bound to `0.0.0.0`, serve the SPA via `ServeStaticModule` with
  `exclude: ["/api/{*path}"]` (Express 5 syntax — the old `/api/*` throws at boot)
- `payments.repository.ts` — wraps `SEED_PAYMENTS`, returns copies, no filtering logic here
- `payments.service.ts` — sorting (FR-1) and status filtering (FR-2). All business logic.
- `payments.controller.ts` — HTTP only. Validates the query with
  `ListPaymentsQuerySchema` through a Zod validation pipe. No logic.
- `health.controller.ts` — `GET /api/health` → `{ status: "ok" }`, zero dependencies
- `problem.filter.ts` — global exception filter emitting RFC 9457
  `application/problem+json`, including the 400 for an invalid status (FR-3)
- Tests: AC-1 through AC-6

**B. Web — `apps/web` (React 19 + TypeScript + Vite)**

- `vite.config.ts` with `server.proxy` for `/api` → `http://localhost:3000`, and
  `build.outDir` = `dist`. All fetches use relative `/api/...` paths — no `VITE_API_URL`.
- `lib/api.ts` — fetch, then `PaymentListResponseSchema.safeParse` the `unknown` body
  before it enters state. A parse failure takes the error path.
- `hooks/usePayments.ts` — returns the `ViewState` union from the `typed-contract-first`
  skill (`loading | error | empty | ready`), with `AbortController` cancellation on filter
  change (FR-12)
- `lib/format.ts` — `formatMoney(amountMinor, currency)` via `Intl.NumberFormat`,
  `formatDate(iso)` via `Intl.DateTimeFormat`. Raw minor units never reach the DOM.
- Components: `PaymentsPage`, `StatusFilter` (driven by `STATUS_FILTER_OPTIONS`),
  `PaymentsTable`, `StatusBadge`, `LoadingState`, `ErrorState` (with Retry), `EmptyState`
- Exhaustive `switch` on `state.kind` with a `never` default. No boolean soup.
- Plain CSS Modules. Semantic `<table>`, `<th scope="col">`, labelled filter control.
- Tests: AC-7 through AC-12

**C. Submission**

- `README.md` generated from `SUBMISSION-README.template.md` against what you actually
  built, with the traceability matrix filled in as you go — not from memory at the end
- Run the `submission-review` checklist and report honestly, including anything unfinished

**Order of work:** API first (A), verify with tests, then web (B), then C. Commit per
requirement: `feat(api): FR-2 server-side status filtering`.

**Before you write code**, give me a short plan: the file tree with one line per file, the
FR→file traceability table, and anything in the specs you think is wrong or
over-engineered for the timebox. Then stop and wait.

**Standing rules:** the spec beats this prompt if they conflict — tell me. Nothing gets
built that the spec does not name: no auth, no database, no pagination, no sorting UI, no
charts, no component library, no Docker. Obvious code over clever code; a reviewer reads
this in ten minutes.

---

## After it builds

Deploy:

```bash
npm ci && npm run build && npm start    # verify locally on :3000 first
railway login
railway init
railway up
railway domain
railway logs
```

Then push to GitHub and put the live URL at the very top of the README.

Two follow-ups worth running before you submit:

> Act as the hiring reviewer. You have ten minutes and you want to reject this. Read the
> repo cold and list, in priority order, everything that would cost me points. Fix nothing
> yet, and don't be kind.

> Write me a 90-second spoken walkthrough for a technical interviewer with a
> regulated-finance background: the three decisions I'd defend, why minor-unit integers
> matter for money, and how the spec-to-code traceability worked. Plain speech, no bullets.
