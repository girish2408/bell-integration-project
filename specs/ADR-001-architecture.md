# ADR-001 — Architecture decisions

Status: **Accepted**. These are settled. Raise a new ADR to change one; do not quietly
deviate during implementation.

---

## D1 — Money as integer minor units

**Decision.** `amountMinor: integer` plus `currency`, never a decimal `amount`.

**Why.** IEEE-754 cannot represent 0.10 exactly. Summing float amounts drifts, and in
payments that drift becomes a reconciliation break. Every serious payments system —
Stripe, Adyen, card schemes — moves integer minor units on the wire.

**Cost.** The API is marginally less obvious to a casual reader, and formatting logic is
required at the edge. Accepted: that formatting belongs at the edge anyway.

---

## D2 — Shared Zod contracts package as the single type source

**Decision.** `packages/contracts` holds Zod schemas; TypeScript types are inferred from
them with `z.infer`. Both apps import from there. The OpenAPI file is the human-readable
statement of the same contract.

**Why.** Hand-written duplicate interfaces in a frontend and a backend drift within days.
Inferring the type from the validator means the compile-time type and the runtime check
cannot disagree — one edit updates both. It also lets the client validate responses, so a
backend change surfaces as a caught error rather than a blank screen.

**Alternative rejected.** Generating types from `openapi.yaml` at build time. Better at
scale; not worth the codegen step and the extra tooling inside a 2-hour timebox.

**Cost.** Zod ships in the frontend bundle (~13 kB gzipped). Worth it for the runtime
guarantee at NFR-3.

---

## D3 — NestJS on the backend

**Decision.** NestJS rather than bare Express.

**Why.** The brief asks for clear route and service structure. Nest makes the
controller/service/repository split the default rather than an act of discipline, gives
DI for free — so the in-memory repository can be swapped for a real one without touching
the service — and provides a first-class exception filter for the problem+json format.

**Cost.** Heavier boilerplate and a slower cold start than Express. For four files of
route surface this is arguably over-scaffolded; the layering is the point being
demonstrated, so the cost is accepted.

---

## D4 — Single Railway service, single origin

**Decision.** The Nest app serves the built SPA as static assets and the API under
`/api`. One Railway service, one URL.

**Why.** No CORS configuration, no build-time API base URL, no environment drift between
local and deployed, and no second service to keep alive. The frontend fetches `/api/...`
relative, which works identically in dev (via the Vite proxy) and in production.

**Alternative rejected.** Two Railway services with `VITE_API_URL`. More realistic for a
production system; for this exercise it adds a class of deployment failure — misconfigured
origin — with no upside for the reviewer.

**Cost.** The frontend cannot be served from a CDN and cannot scale independently. Both
irrelevant here, and both are noted in the README as the first thing to change if this
grew.

---

## D5 — In-memory repository behind an interface

**Decision.** Seed data lives in an array, reached through a `PaymentsRepository` class
that the service depends on.

**Why.** The brief says a database is optional. The interface boundary is what matters:
it shows where persistence would attach without spending the timebox on schema, migrations
and connection handling.

**Cost.** State resets on every deploy and every restart. Correct for a read-only demo.

---

## D6 — Server-side filtering

**Decision.** The `status` filter is applied by the API, not by the client on a
full dataset.

**Why.** With 12 rows client-side filtering is faster and simpler. It is also the wrong
habit: at 12,000 rows it stops working, and the exercise is judging how you would build
the real thing. Filtering server-side also gives FR-3 something to validate.

**Cost.** A network round trip per filter change. Mitigated by aborting the in-flight
request (FR-12).

---

## D7 — No component library, no state library

**Decision.** Plain CSS Modules and React's own hooks. No MUI, Tailwind, Redux, or
TanStack Query.

**Why.** A reviewer cannot see your CSS or state judgement through a component library.
One screen with one async resource does not need a cache layer. Fewer dependencies means
every one present can be defended.

**Cost.** More hand-written CSS, and a hand-rolled fetch hook that a real project would
delegate to TanStack Query. The README says so explicitly rather than pretending the
hand-rolled version is the better long-term answer.

---

## D8 — Tests target logic, not framework

**Decision.** Test the filter behaviour, the contract schema, and the view-state
transitions. Do not test that Nest routes or that React renders.

**Why.** Inside a timebox, test count is not the signal — test selection is. A reviewer
reads which behaviours you thought were worth protecting.

**Cost.** Coverage percentage looks low. The README states the reasoning so it reads as a
choice rather than an omission.
