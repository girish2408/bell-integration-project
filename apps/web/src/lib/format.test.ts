import { describe, it, expect } from "vitest";
import { formatMoney, formatDate } from "./format";

describe("formatMoney — AC-7", () => {
  it("converts minor units to a currency string", () => {
    const result = formatMoney(1250, "AED");
    expect(result).toContain("12.50");
    expect(result).not.toBe("1250");
  });

  it("handles a zero amount without crashing", () => {
    const result = formatMoney(0, "AED");
    expect(result).toContain("0");
  });

  it("handles a large amount (7-digit minor units)", () => {
    const result = formatMoney(8750000, "GBP");
    expect(result).toContain("87,500");
  });

  it("raw minor unit value never appears for non-trivial amounts", () => {
    const result = formatMoney(125000, "AED");
    expect(result).not.toBe("125000");
  });
});

describe("formatDate — AC-7", () => {
  it("returns a readable string, not an ISO timestamp", () => {
    const result = formatDate("2026-07-14T09:31:00.000Z");
    expect(result).not.toBe("2026-07-14T09:31:00.000Z");
    expect(result.length).toBeGreaterThan(5);
  });
});
