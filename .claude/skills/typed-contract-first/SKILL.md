---
name: typed-contract-first
description: Use when a TypeScript frontend and backend share data across a network boundary. Covers Zod-as-source-of-truth, inferring types from validators, validating at both edges, modelling money and dates safely, and exhaustive view-state unions. Trigger before writing any DTO, interface, API response type, or fetch hook.
---

# Typed contract-first

TypeScript stops at the network boundary. `await res.json()` is `any` wearing a costume:
the compiler believes whatever you assert, and the server believes nothing. A contract
package closes that gap by making one definition produce both the compile-time type and
the runtime check.

## Rule 1 — One definition, inferred both ways

Define the schema. Infer the type. Never write both by hand.

```ts
// packages/contracts/src/payment.ts
import { z } from "zod";

export const PaymentStatus = z.enum(["pending", "approved", "rejected"]);
export const StatusFilter = z.enum(["all", ...PaymentStatus.options]);

export const PaymentSchema = z.object({
  id: z.string().regex(/^pay_[A-Za-z0-9]{10,}$/),
  amountMinor: z.number().int().nonnegative(),
  currency: z.enum(["AED", "USD", "EUR", "GBP"]),
  status: PaymentStatus,
  createdAt: z.string().datetime(),
}).strict();

export const PaymentListResponseSchema = z.object({
  items: z.array(PaymentSchema),
  total: z.number().int().nonnegative(),
}).strict();

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatus>;
export type StatusFilter = z.infer<typeof StatusFilter>;
export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
```

`.strict()` is deliberate: an unexpected field means the contract moved and you want to
know, not silently absorb it.

Both apps import from this package. If you find yourself typing `interface Payment` in an
app folder, stop — you have just created the drift you were preventing.

## Rule 2 — Validate at both edges

- **Server, on the way in.** Parse query params and bodies with the schema. Do not trust a
  string from a URL because the type annotation says it is a union.
- **Client, on the way in.** Parse the response before it enters React state. A backend
  that changed shape should produce a caught error and your error state, not `undefined is
  not an object` three components deep.

```ts
const json: unknown = await res.json();
const parsed = PaymentListResponseSchema.safeParse(json);
if (!parsed.success) throw new ContractError("Unexpected response shape");
return parsed.data;
```

Note the `unknown`. Annotating that as `PaymentListResponse` is the lie the whole pattern
exists to prevent.

## Rule 3 — Money is an integer in minor units

Never a `number` of major units, never a `string` you plan to parse.

```ts
export function formatMoney(amountMinor: number, currency: string, locale = "en-AE") {
  return new Intl.NumberFormat(locale, { style: "currency", currency })
    .format(amountMinor / 100);
}
```

Divide once, at the render edge. If the divisor concerns you: JPY and KWD have different
minor-unit exponents, so a real system reads the exponent from a currency table. Say that
out loud in the README rather than pretending `/100` is universal — knowing the limitation
scores better than an unmarked bug.

## Rule 4 — Dates cross the wire as ISO strings

`Date` objects do not survive JSON. Type the DTO field as `string`, validate with
`.datetime()`, and construct a `Date` only where you format:

```ts
new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" })
  .format(new Date(createdAt));
```

Never hand-format with slashes. `03/04/2026` is two different days depending on the reader.

## Rule 5 — Filter vocabulary is not domain vocabulary

`all` is something a user asks for; it is not something a payment can be. Keep them as
separate types, and let the compiler catch the day someone writes
`payment.status === "all"`.

## Rule 6 — View state is a union, not a bag of booleans

```ts
type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string; retry: () => void }
  | { kind: "empty"; filter: StatusFilter }
  | { kind: "ready"; payments: Payment[] };
```

Four states, four renders, exhaustively switched. The boolean version —
`isLoading`, `error`, `data` — permits sixteen combinations, of which twelve are
nonsense, and one of them is the blank screen users report as "it's broken".

Add a `never` check on the default branch so a new state cannot be added without handling it.

## Rule 7 — Abort in-flight requests

When the query changes, cancel the old request. Otherwise a slow first response can land
after a fast second one and paint stale data over fresh:

```ts
useEffect(() => {
  const ac = new AbortController();
  fetchPayments(filter, ac.signal).then(setState).catch(ignoreAbort);
  return () => ac.abort();
}, [filter]);
```

## Checklist

- [ ] Zero `any`, zero `as` on API responses, zero non-null assertions
- [ ] `Payment` declared exactly once in the whole repo
- [ ] Server validates input; client validates output
- [ ] Money stored as integer minor units, formatted once with `Intl.NumberFormat`
- [ ] Dates typed as ISO strings, formatted with `Intl.DateTimeFormat`
- [ ] View state is an exhaustively-handled union
- [ ] In-flight requests aborted on dependency change
