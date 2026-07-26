import { describe, it, expect } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController — AC-5", () => {
  it("GET /api/health returns { status: 'ok' }", () => {
    const ctrl = new HealthController();
    expect(ctrl.health()).toEqual({ status: "ok" });
  });
});
