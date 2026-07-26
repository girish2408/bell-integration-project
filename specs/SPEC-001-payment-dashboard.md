# SPEC-001 — Payments Dashboard

| Field | Value |
|---|---|
| Status | Approved for build |
| Version | 1.0 |
| Timebox | 2 hours |
| Owner | Girish |
| Supersedes | — |

## 1. Context

A fintech SaaS product needs an internal dashboard so an operations user can see incoming
payments and narrow them by approval status. This is the first slice: read-only listing.
Nothing in this spec implies a future write path, and none should be built.

## 2. Goal

Demonstrate a typed frontend, a cleanly layered backend, and a shared contract between
them — deployed and reachable on a public URL.

## 3. Non-goals

Explicitly out of scope, and building any of these is a defect against this spec:
authentication, persistence, payment mutation, pagination, sorting, search, currency
conversion, multi-tenancy, audit logging, real-time updates.

## 4. Personas

**Ops reviewer.** Opens the dashboard several times a day, wants to see which payments are
still pending. Not technical. Cares that amounts are unambiguous and that the page tells
them plainly when something is broken.

## 5. Data model

A **Payment** is an immutable record of a payment instruction.

| Field         | Type                                   | Notes |
|---------------|----------------------------------------|-------|
| `id`          | `string`, pattern `^pay_[A-Za-z0-9]{10,}$` | Opaque. Never parsed by the client. |
| `amountMinor` | `integer`, `>= 0`                      | Minor units of `currency`. See DR-1. |
| `currency`    | `string`, ISO 4217, enum `AED, USD, EUR, GBP` | Uppercase. |
| `status`      | `"pending" \| "approved" \| "rejected"` | Lowercase literal union. |
| `createdAt`   | `string`, ISO 8601 UTC (`Z` suffix)     | When the instruction was created. |

**DR-1 — Money representation.** Amounts are integers in the currency's minor unit
(fils, cents, pence). Floating-point money is prohibited: `0.1 + 0.2 !== 0.3`, and in a
payments context that silently corrupts totals and reconciliation. Conversion to a display
string happens exactly once, in the presentation layer, via `Intl.NumberFormat`.

**DR-2 — Status vocabulary.** `all` is a filter value only. It must not be representable
as a `Payment["status"]`. The type system enforces this separation.

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **FR-1** | The API exposes `GET /api/payments` returning every payment in the store, newest `createdAt` first. | Must |
| **FR-2** | `GET /api/payments` accepts an optional `status` query parameter. When present and not `all`, only payments with that status are returned. Filtering happens server-side. | Must |
| **FR-3** | An unrecognised `status` value returns HTTP 400 with an `application/problem+json` body naming the invalid parameter and the permitted values. | Must |
| **FR-4** | The API exposes `GET /api/health` returning HTTP 200 and `{ "status": "ok" }`, used as the deployment health check. | Must |
| **FR-5** | The web app renders payments in a table with columns: Payment ID, Amount, Currency, Status, Created. | Must |
| **FR-6** | The web app offers a status filter control with options All, Pending, Approved, Rejected. Changing it refetches from the API with the corresponding query parameter. | Must |
| **FR-7** | While a request is in flight the app shows a loading state. The previous table is not left on screen pretending to be current. | Must |
| **FR-8** | If the request fails — network error, non-2xx, or a response failing contract validation — the app shows a plain-language error message and a retry action. It never renders a blank page or a raw stack trace. | Must |
| **FR-9** | If the request succeeds but returns zero payments, the app shows a distinct empty state, worded to reflect the active filter. | Must |
| **FR-10** | Amounts render as localised currency strings derived from `amountMinor` and `currency`. Dates render in a human-readable, unambiguous format (no `MM/DD` vs `DD/MM` ambiguity). | Must |
| **FR-11** | Payment status renders as a visually distinguishable badge. Colour is not the only signal — the text label is always present. | Should |
| **FR-12** | Rapid filter changes do not produce out-of-order renders. An in-flight request is aborted when the filter changes. | Should |

## 7. Non-functional requirements

| ID | Requirement |
|----|-------------|
| **NFR-1** | TypeScript `strict: true` across all workspaces. No `any`, no non-null assertions, no `@ts-ignore`. |
| **NFR-2** | The `Payment` type is declared once, in `packages/contracts`, and imported by both apps. Any duplicate declaration is a defect. |
| **NFR-3** | API responses are validated against the contract schema on the client before entering React state. A malformed response takes the error path, not the render path. |
| **NFR-4** | The backend is layered: controller (HTTP) → service (business rules) → repository (data). No business logic in the controller, no HTTP concepts in the service. |
| **NFR-5** | The app deploys as a single Railway service on one origin. The frontend calls the API with relative paths, so no CORS configuration and no build-time API URL are required. |
| **NFR-6** | `npm install && npm run dev` works from a clean clone on Node 20+, with no manual steps beyond what the README states. |
| **NFR-7** | Total production dependencies stay under 15 across the repo. Every one must be defensible in interview. |
| **NFR-8** | The table is keyboard-navigable and the filter control is labelled. Semantic `<table>` markup, not a grid of `<div>`s. |

## 8. Seed data

Twelve payments. At least three in each status. Currencies spread across all four enum
values. `createdAt` values spread over roughly the last 30 days, deliberately unsorted in
the source array so that FR-1's ordering requirement is actually exercised. Include at
least one large amount (7+ digits in minor units) to prove the formatter holds up, and one
zero amount to prove `>= 0` is intended rather than accidental.

## 9. Traceability

Every FR is mapped to an implementing file and a proving test in the README matrix before
submission. An unmapped FR is an incomplete build, regardless of whether the feature
appears to work.
