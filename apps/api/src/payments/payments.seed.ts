import { PaymentSchema, type Payment } from "@pay/contracts";

/**
 * Seed payments (SPEC-001 §8).
 *
 * Deliberately UNSORTED in this array so that FR-1's "newest first" ordering is
 * genuinely exercised by the service rather than accidentally satisfied by input order.
 *
 * Coverage baked in on purpose:
 *   - 5 approved / 4 pending / 3 rejected  → every filter returns a non-empty set
 *   - all four currencies represented      → formatter is exercised across locales
 *   - dates spread over ~30 days           → date formatting is visibly varied
 *   - one 7-digit minor amount (pay_01HQC7T2W9 → £87,500.00) → formatter holds at scale
 *   - one 2-digit minor amount (pay_01HQF4J9Q2 → $0.99)      → no leading-zero bug
 *   - one zero amount (pay_01HQB5R8N1)      → see note below
 *
 * The zero-amount record is not filler: a 0-value authorisation is how card networks
 * verify an account without moving funds. It is the reason `amountMinor` is
 * `.nonnegative()` rather than `.positive()`, and it is a real edge case for any
 * formatter or "is this row empty" check.
 */
export const SEED_PAYMENTS: readonly Payment[] = [
  {
    id: "pay_01HQ9XKT4M",
    amountMinor: 125000,
    currency: "AED",
    status: "approved",
    createdAt: "2026-07-14T09:31:00.000Z",
  },
  {
    id: "pay_01HQB5R8N1",
    amountMinor: 0,
    currency: "AED",
    status: "rejected",
    createdAt: "2026-06-28T07:12:00.000Z",
  },
  {
    id: "pay_01HQG6K3X8",
    amountMinor: 675000,
    currency: "EUR",
    status: "pending",
    createdAt: "2026-07-23T08:15:00.000Z",
  },
  {
    id: "pay_01HQC7T2W9",
    amountMinor: 8750000,
    currency: "GBP",
    status: "approved",
    createdAt: "2026-07-02T11:45:00.000Z",
  },
  {
    id: "pay_01HQA2M7V3",
    amountMinor: 4999,
    currency: "USD",
    status: "pending",
    createdAt: "2026-07-22T16:04:00.000Z",
  },
  {
    id: "pay_01HQE8G1Z7",
    amountMinor: 156025,
    currency: "AED",
    status: "rejected",
    createdAt: "2026-07-08T05:58:00.000Z",
  },
  {
    id: "pay_01HQM5S7E1",
    amountMinor: 1250,
    currency: "AED",
    status: "approved",
    createdAt: "2026-07-05T19:26:00.000Z",
  },
  {
    id: "pay_01HQD3F6Y4",
    amountMinor: 23400,
    currency: "EUR",
    status: "pending",
    createdAt: "2026-07-19T13:20:00.000Z",
  },
  {
    id: "pay_01HQH1L5B6",
    amountMinor: 42150,
    currency: "GBP",
    status: "rejected",
    createdAt: "2026-07-11T21:07:00.000Z",
  },
  {
    id: "pay_01HQF4J9Q2",
    amountMinor: 99,
    currency: "USD",
    status: "approved",
    createdAt: "2026-06-25T18:33:00.000Z",
  },
  {
    id: "pay_01HQK2P8D5",
    amountMinor: 7825,
    currency: "USD",
    status: "pending",
    createdAt: "2026-07-17T10:02:00.000Z",
  },
  {
    id: "pay_01HQJ9N4C3",
    amountMinor: 310000,
    currency: "AED",
    status: "approved",
    createdAt: "2026-06-30T14:49:00.000Z",
  },
];

/**
 * Validate the seed against the shared contract at module load.
 *
 * This is cheap and it is the point: if someone edits this file and breaks the
 * contract, the process refuses to start instead of shipping a malformed payload
 * that only fails at the client's `safeParse`. Fail at the earliest possible edge.
 */
for (const payment of SEED_PAYMENTS) {
  const result = PaymentSchema.safeParse(payment);
  if (!result.success) {
    throw new Error(
      `Seed data violates the payment contract (${payment.id}): ${result.error.message}`,
    );
  }
}
