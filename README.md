# Payments Dashboard

A full-stack payments dashboard: NestJS API + React SPA, spec-driven, deployed as one Railway service.

**Live:** `https://<your-service>.up.railway.app` *(fill in after deploy)*

---

## Run it locally

Requires Node 20+.

```bash
npm install
npm run build     # contracts → api → web
npm start         # everything on :3000
```

Dev (hot-reload web on :5173, API on :3000):

```bash
npm run dev
```

Tests:

```bash
npm test
```

---

## What was built

| Requirement | Status |
|---|---|
| `GET /api/payments` — list all payments, newest first | ✅ FR-1 |
| `?status=` filter (all / pending / approved / rejected) | ✅ FR-2 server-side |
| Invalid status → 400 `application/problem+json` | ✅ FR-3 |
| `GET /api/health` → `{ status: "ok" }` | ✅ FR-4 |
| Payments table (ID, Amount, Currency, Status, Created) | ✅ FR-5 |
| Status filter control refetches from the API | ✅ FR-6 |
| Loading state while request is in flight | ✅ FR-7 |
| Error state with Retry on network / non-2xx / schema failure | ✅ FR-8 |
| Empty state when filter matches no payments | ✅ FR-9 |
| Amounts formatted via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat` | ✅ FR-10 |
| Status badge — colour + text label | ✅ FR-11 |
| In-flight request aborted on filter change | ✅ FR-12 |

Not built (per spec): auth, database, pagination, sorting UI, charts, component library, Docker.

---

## Architecture

```
apps/api/           NestJS 11 — controller → service → in-memory repository
apps/web/           React 19 + Vite SPA
packages/contracts/ Zod schemas; every type in the repo is inferred from here
specs/              Numbered FRs, OpenAPI contract, ADRs
```

One Railway service serves both: the API under `/api`, the built SPA everywhere else. Same origin — no CORS config, no build-time API URL.

---

## Assumptions

1. **Money is an integer in minor units.** `amountMinor: 1250` + `currency: "AED"` = AED 12.50. The formatter assumes a 2-digit minor unit — a production system reads the exponent per currency (JPY is 0, KWD is 3). Noted as a known limitation.
2. **`all` is a filter value, not a payment status.** Separate types; the compiler rejects `payment.status === "all"`.
3. **Payments are read-only.** No write path was designed for.
4. **Single-user internal tool.** No auth — the brief did not ask and a placeholder would be theatre.

---

## Trade-offs

**In-memory data behind a repository interface.** The brief made a database optional. The interesting part is where persistence attaches — the boundary exists and the implementation is a one-line swap. State resets on restart: fine for a read-only demo, unacceptable the moment anything writes.

**NestJS over Express.** For two routes this is over-scaffolded. The brief asked for clear route and service structure; Nest makes that the default rather than an act of discipline. DI means the repository swap above is genuinely one line.

**Server-side filtering.** With 12 rows, client-side filtering would be faster. It stops working at 12 000 rows, so the server does it. Cost: a round trip per filter change, mitigated by aborting the in-flight request.

**Hand-rolled fetch hook.** One screen, one async resource — no cache layer needed. On a real project I would use TanStack Query and delete the hook.

**Tests target logic, not framework.** Filter behaviour, contract schema, view-state transitions. Not that Nest routes or that React renders. Coverage percentage looks low by choice.

---

## Known limitations / next steps

- No persistence — swap `PaymentsRepository` for Prisma; the service does not change.
- No pagination — `total` is already in the response envelope.
- Currency minor-unit exponent hardcoded to 2.
- Single service means the SPA cannot be CDN-served or scaled independently.
- No CI — GitHub Actions running typecheck + tests + build on PR would be the first addition.

---

## Traceability

| Req | Implementation | Proof |
|-----|----------------|-------|
| FR-1 | `apps/api/src/payments/payments.service.ts` | `payments.service.spec.ts` › AC-1 |
| FR-2 | `apps/api/src/payments/payments.service.ts` | `payments.service.spec.ts` › AC-2, AC-3 |
| FR-3 | `apps/api/src/common/zod-validation.pipe.ts` + `problem.filter.ts` | `payments.controller.spec.ts` › AC-4 |
| FR-4 | `apps/api/src/health/health.controller.ts` | `health.controller.spec.ts` › AC-5 |
| FR-5 | `apps/web/src/components/PaymentsTable.tsx` | `PaymentsTable.test.tsx` › AC-7 |
| FR-6 | `apps/web/src/components/StatusFilter.tsx` | `PaymentsPage.test.tsx` › AC-8 |
| FR-7 | `apps/web/src/hooks/usePayments.ts` + `LoadingState.tsx` | `usePayments.test.ts` › AC-9 |
| FR-8 | `apps/web/src/lib/api.ts` + `ErrorState.tsx` | `usePayments.test.ts` › AC-10 |
| FR-9 | `apps/web/src/components/EmptyState.tsx` | `PaymentsPage.test.tsx` › AC-11 |
| FR-10 | `apps/web/src/lib/format.ts` | `format.test.ts` + `PaymentsTable.test.tsx` |
| FR-11 | `apps/web/src/components/StatusBadge.tsx` | manual — AC-13 |
| FR-12 | `apps/web/src/hooks/usePayments.ts` | `usePayments.test.ts` › AC-12 |
