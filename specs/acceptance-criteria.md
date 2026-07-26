# Acceptance Criteria — SPEC-001

Each scenario names the requirement it proves. A scenario is either automated (Vitest) or
listed in the README as a documented manual check. Nothing ships as "probably fine".

## API

**AC-1 — Unfiltered listing** *(FR-1)*
- **Given** the seed store holds 12 payments
- **When** `GET /api/payments` is called
- **Then** the response is 200, `total` is 12, and `items[0].createdAt` is the most recent
  instant in the set
- *Automated.*

**AC-2 — Status filtering** *(FR-2)*
- **Given** the seed store holds payments in all three statuses
- **When** `GET /api/payments?status=pending` is called
- **Then** every returned item has `status === "pending"` and `total` equals that count
- *Automated.*

**AC-3 — `all` is a pass-through** *(FR-2)*
- **When** `GET /api/payments?status=all` is called
- **Then** the result is byte-identical to the unfiltered call
- *Automated.*

**AC-4 — Invalid filter rejected** *(FR-3)*
- **When** `GET /api/payments?status=banana` is called
- **Then** the response is 400, the content type is `application/problem+json`, and
  `detail` lists the four permitted values
- *Automated.*

**AC-5 — Health probe** *(FR-4)*
- **When** `GET /api/health` is called
- **Then** the response is 200 with `{ "status": "ok" }`
- *Automated.*

**AC-6 — Contract conformance** *(NFR-2, NFR-3)*
- **When** any `/api/payments` response is parsed by the shared Zod schema
- **Then** parsing succeeds with no unknown keys and no type coercion
- *Automated.*

## Web

**AC-7 — Table render** *(FR-5, FR-10)*
- **Given** the API returns a payment of 1250 AED minor units created 14 July 2026
- **When** the page renders
- **Then** a table row shows the payment ID, `AED 12.50`, the status label, and an
  unambiguous date — and `1250` appears nowhere on screen
- *Automated.*

**AC-8 — Filter drives the request** *(FR-6)*
- **When** the user selects "Approved"
- **Then** exactly one request is issued to `/api/payments?status=approved` and the table
  reflects its response
- *Automated.*

**AC-9 — Loading state** *(FR-7)*
- **When** a request is in flight
- **Then** the loading indicator is visible and no stale table is displayed
- *Automated with a deferred fetch mock.*

**AC-10 — Error state** *(FR-8)*
- **Given** the API returns 500, or the fetch rejects, or the payload fails schema validation
- **When** the page settles
- **Then** a plain-language message and a working Retry control are shown, and the console
  contains no unhandled rejection
- *Automated across all three failure modes.*

**AC-11 — Empty state** *(FR-9)*
- **Given** a filter matches no payments
- **When** the response resolves
- **Then** an empty-state message naming the active filter is shown — not an empty table,
  not the error state
- *Automated.*

**AC-12 — Race safety** *(FR-12)*
- **When** the filter is changed twice in quick succession and the first response resolves last
- **Then** the table shows the result of the second selection
- *Automated with staggered mocks.*

**AC-13 — Accessibility floor** *(NFR-8)*
- **Then** the filter control has an associated label, the table uses `<th scope="col">`
  headers, and status is conveyed by text as well as colour
- *Manual check, recorded in the README.*

## Deployment

**AC-14 — Single origin** *(NFR-5)*
- **When** the deployed URL is opened
- **Then** the SPA loads, `/api/payments` resolves on the same origin, and there is no
  CORS header anywhere in the response
- *Manual check against the live Railway URL.*

**AC-15 — Deep-link fallback** *(NFR-5)*
- **When** an unknown non-API path is requested directly
- **Then** the SPA `index.html` is served rather than a 404 — and `/api/unknown` still
  returns a JSON 404, not HTML
- *Manual check.*

**AC-16 — Cold clone** *(NFR-6)*
- **Given** a fresh clone on Node 20+
- **When** the README steps are followed verbatim
- **Then** the app runs locally with no undocumented step
- *Manual check before submission. Do this in a clean directory, not your dev folder.*
