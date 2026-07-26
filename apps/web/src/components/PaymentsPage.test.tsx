import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentsPage } from "./PaymentsPage";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const makeResponse = (status: string) => ({
  ok: true,
  json: () =>
    Promise.resolve({
      items: [
        {
          id: "pay_01HQ9XKT4M",
          amountMinor: 500,
          currency: "USD",
          status,
          createdAt: "2026-07-14T09:31:00.000Z",
        },
      ],
      total: 1,
    }),
});

const emptyResponse = () => ({
  ok: true,
  json: () => Promise.resolve({ items: [], total: 0 }),
});

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockReturnValue(makeResponse("approved"));
});

describe("PaymentsPage — AC-8 filter drives request", () => {
  it("changing the filter sends a request with the selected status", async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValue(makeResponse("approved"));

    render(<PaymentsPage />);
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());

    await user.selectOptions(screen.getByLabelText(/filter by status/i), "approved");

    await waitFor(() => {
      const calls: string[] = mockFetch.mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      expect(calls.some((url) => url.includes("status=approved"))).toBe(true);
    });
  });
});

describe("PaymentsPage — AC-11 empty state", () => {
  it("shows the empty state message when no payments match the filter", async () => {
    mockFetch.mockReturnValue(emptyResponse());
    render(<PaymentsPage />);
    await waitFor(() =>
      expect(screen.getByText(/no payments found/i)).toBeInTheDocument(),
    );
    expect(screen.queryByRole("table")).toBeNull();
  });
});
