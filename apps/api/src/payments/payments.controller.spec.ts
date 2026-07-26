import { describe, it, expect } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { ListPaymentsQuerySchema } from "@pay/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe";

describe("ZodValidationPipe — AC-4", () => {
  const pipe = new ZodValidationPipe(ListPaymentsQuerySchema);

  it("rejects an unrecognised status value with BadRequestException", () => {
    expect(() =>
      pipe.transform({ status: "banana" }, { type: "query" }),
    ).toThrow(BadRequestException);
  });

  it("error detail names all four permitted values", () => {
    try {
      pipe.transform({ status: "banana" }, { type: "query" });
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as Record<
        string,
        string
      >;
      expect(body["detail"]).toContain("all");
      expect(body["detail"]).toContain("pending");
      expect(body["detail"]).toContain("approved");
      expect(body["detail"]).toContain("rejected");
    }
  });

  it("accepts valid status values", () => {
    const result = pipe.transform({ status: "pending" }, { type: "query" });
    expect(result).toEqual({ status: "pending" });
  });

  it("defaults missing status to 'all'", () => {
    const result = pipe.transform({}, { type: "query" });
    expect(result).toEqual({ status: "all" });
  });
});
