# CLAUDE.md — Payments Dashboard

## What this is

A small full-stack payments dashboard built as a technical exercise. Timebox: 2 hours of
effort. Optimised for a reviewer who will read it in 10 minutes and judge structure,
typing, and judgement — not feature count.

## Source of truth

`specs/` is binding. Code that disagrees with the spec is a bug in the code.
`specs/openapi.yaml` is the API contract. `packages/contracts` is the runtime expression
of that contract. Nothing outside `packages/contracts` may define a `Payment` type.

## Stack (decided — see ADR-001)

| Layer     | Choice                                   |
|-----------|------------------------------------------|
| Backend   | NestJS 11 + TypeScript                   |
| Frontend  | React 19 + TypeScript + Vite             |
| Shared    | Zod schemas in `packages/contracts`      |
| Repo      | npm workspaces (no Turbo, no Nx)         |
| Data      | In-memory array — no database            |
| Styling   | Plain CSS Modules                        |
| Tests     | Vitest                                   |
| Hosting   | Railway — one service, one origin        |

## Layout

```
.
├── apps/
│   ├── api/          NestJS: controller → service → repository
│   └── web/          React SPA
├── packages/
│   └── contracts/    Zod schemas + inferred types (shared)
├── specs/            The specification. Read before coding.
├── .claude/skills/   Skills governing how this is built
├── railway.json
└── README.md
```

## Conventions

- **Money is an integer in minor units.** `amountMinor: 1250` with `currency: "AED"` is
  AED 12.50. Floats never touch money. Formatting happens once, at the render edge.
- **Dates are ISO 8601 UTC strings** on the wire. Never a `Date` in a DTO.
- **Status is a lowercase literal union**: `pending | approved | rejected`. The `all`
  value is a *filter* value, never a payment status.
- **Errors are RFC 9457 `application/problem+json`.** One global exception filter. No
  `try/catch` scattered through controllers.
- **View state is an explicit union**, never a pile of booleans. `isLoading && !error &&
  data?.length` is a code smell here.
- Barrel files only in `packages/contracts`.
- No `any`. No non-null assertions (`!`). `strict: true` everywhere.

## Guardrails

- Do not add: auth, a database, pagination, sorting, CSV export, charts, a component
  library, a state-management library, Docker, CI pipelines, or a dark-mode toggle.
- Do not exceed three dependencies per workspace beyond the framework itself.
- Do not write tests that assert the framework works. Test the filter logic, the contract
  validation, and the view-state reducer. That is enough.
- Every commit message carries the requirement ID it advances.

## Definition of done

A requirement is done when: the code exists, a test or a documented manual step proves it,
and the traceability matrix in `README.md` names the file. All three, or it is not done.
