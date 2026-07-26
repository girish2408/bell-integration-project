import { describe, it, expect, beforeEach } from "vitest";
import { PaymentListResponseSchema } from "@pay/contracts";
import { PaymentsService } from "./payments.service";
import { PaymentsRepository } from "./payments.repository";

describe("PaymentsService", () => {
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService(new PaymentsRepository());
  });

  it("AC-1: returns all 12 payments newest first", () => {
    const result = service.listPayments({ status: "all" });
    expect(result.total).toBe(12);
    expect(result.items).toHaveLength(12);
    for (let i = 1; i < result.items.length; i++) {
      const prev = result.items[i - 1];
      const curr = result.items[i];
      if (prev && curr) {
        expect(new Date(prev.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(curr.createdAt).getTime(),
        );
      }
    }
  });

  it("AC-2: status=pending returns only pending payments", () => {
    const result = service.listPayments({ status: "pending" });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((p) => p.status === "pending")).toBe(true);
    expect(result.total).toBe(result.items.length);
  });

  it("AC-3: status=all returns all 12", () => {
    const result = service.listPayments({ status: "all" });
    expect(result.total).toBe(12);
  });

  it("AC-6: output satisfies the shared contract schema", () => {
    const result = service.listPayments({ status: "all" });
    const parsed = PaymentListResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
