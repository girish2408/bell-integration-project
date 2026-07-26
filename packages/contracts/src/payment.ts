/**
 * The single source of truth for every payment type in this repo.
 *
 * Types are INFERRED from these schemas (z.infer), never hand-written alongside them.
 * If you are about to declare `interface Payment` anywhere else, stop — import it here.
 *
 * Mirrors specs/openapi.yaml. If the two disagree, that is a defect.
 *
 * Zod 3.25 syntax. On Zod 4, `z.string().datetime()` becomes `z.iso.datetime()`.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/**
 * The lifecycle state of a payment. Deliberately does NOT include "all" —
 * "all" is something a user asks for, not something a payment can be.
 */
export const PaymentStatusSchema = z.enum(["pending", "approved", "rejected"]);

/**
 * Query-side vocabulary only. Separate from PaymentStatusSchema by design, so the
 * compiler rejects `payment.status === "all"`.
 */
export const StatusFilterSchema = z.enum([
  "all",
  ...PaymentStatusSchema.options,
]);

/** ISO 4217 alphabetic codes, uppercase. All have a 2-digit minor unit. */
export const CurrencySchema = z.enum(["AED", "USD", "EUR", "GBP"]);

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export const PaymentSchema = z
  .object({
    /** Opaque identifier. Never parsed by the client. */
    id: z.string().regex(/^pay_[A-Za-z0-9]{10,}$/, "Invalid payment id format"),

    /**
     * Amount in the MINOR unit of `currency` (fils, cents, pence).
     * 1250 + "AED" means AED 12.50.
     *
     * Integer, not float: IEEE-754 cannot represent 0.10 exactly, and in a payments
     * context that drift becomes a reconciliation break. Division to major units
     * happens exactly once, at the render edge.
     */
    amountMinor: z.number().int().nonnegative(),

    currency: CurrencySchema,
    status: PaymentStatusSchema,

    /** ISO 8601 instant in UTC, trailing Z. A Date object never crosses the wire. */
    createdAt: z.string().datetime(),
  })
  .strict(); // an unexpected field means the contract moved — fail loudly

export const PaymentListResponseSchema = z
  .object({
    /** Sorted by createdAt descending (FR-1). */
    items: z.array(PaymentSchema),
    /** Count after filtering. Present so pagination can be added without a breaking change. */
    total: z.number().int().nonnegative(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

/** Validates the `?status=` query parameter. Missing → "all". */
export const ListPaymentsQuerySchema = z
  .object({
    status: StatusFilterSchema.optional().default("all"),
  })
  .strict();

// ---------------------------------------------------------------------------
// Errors — RFC 9457 problem+json
// ---------------------------------------------------------------------------

export const ProblemSchema = z.object({
  type: z.string().default("about:blank"),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Inferred types — the only place these come from
// ---------------------------------------------------------------------------

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type StatusFilter = z.infer<typeof StatusFilterSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
export type ListPaymentsQuery = z.infer<typeof ListPaymentsQuerySchema>;
export type Problem = z.infer<typeof ProblemSchema>;

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/** Drives the filter control options in the UI. Order is intentional. */
export const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = [
  "all",
  "pending",
  "approved",
  "rejected",
] as const;

/**
 * Minor-unit exponent. Hardcoded to 2 because every currency in CurrencySchema
 * uses 2 decimal places. A production system reads this per-currency: JPY is 0,
 * KWD and BHD are 3. Noted as a known limitation rather than silently assumed.
 */
export const MINOR_UNIT_EXPONENT = 2;
