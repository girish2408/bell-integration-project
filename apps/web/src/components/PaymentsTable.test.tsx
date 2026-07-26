import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentsTable } from "./PaymentsTable";
import type { Payment } from "@pay/contracts";

const payment: Payment = {
  id: "pay_01HQ9XKT4M",
  amountMinor: 1250,
  currency: "AED",
  status: "approved",
  createdAt: "2026-07-14T09:31:00.000Z",
};

describe("PaymentsTable — AC-7", () => {
  it("renders the payment ID", () => {
    render(<PaymentsTable payments={[payment]} />);
    expect(screen.getByText("pay_01HQ9XKT4M")).toBeInTheDocument();
  });

  it("renders the currency string with decimal expansion, not raw minor units", () => {
    render(<PaymentsTable payments={[payment]} />);
    expect(screen.queryByText("1250")).toBeNull();
    const cell = screen.getByText(/12\.50/);
    expect(cell).toBeInTheDocument();
  });

  it("renders a StatusBadge with the status text", () => {
    render(<PaymentsTable payments={[payment]} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("uses th[scope=col] headers", () => {
    render(<PaymentsTable payments={[payment]} />);
    const headers = document.querySelectorAll("th[scope='col']");
    expect(headers.length).toBeGreaterThan(0);
  });
});
