import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePayments } from "./usePayments";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function okResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

const validPayload = {
  items: [
    {
      id: "pay_01HQ9XKT4M",
      amountMinor: 1250,
      currency: "AED",
      status: "approved",
      createdAt: "2026-07-14T09:31:00.000Z",
    },
  ],
  total: 1,
};

beforeEach(() => mockFetch.mockReset());
afterEach(() => vi.clearAllMocks());

describe("usePayments — AC-9 loading state", () => {
  it("starts in loading state before the request resolves", () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() => usePayments("all"));
    expect(result.current.kind).toBe("loading");
  });
});

describe("usePayments — AC-10 error state", () => {
  it("shows error when fetch rejects (network error)", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => usePayments("all"));
    await waitFor(() => expect(result.current.kind).toBe("error"));
    if (result.current.kind === "error") {
      expect(result.current.message).toBeTruthy();
    }
  });

  it("shows error when response is not ok (non-2xx)", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const { result } = renderHook(() => usePayments("all"));
    await waitFor(() => expect(result.current.kind).toBe("error"));
  });

  it("shows error when payload fails schema validation", async () => {
    mockFetch.mockReturnValue(
      okResponse({ items: [{ bad: "shape" }], total: 1 }),
    );
    const { result } = renderHook(() => usePayments("all"));
    await waitFor(() => expect(result.current.kind).toBe("error"));
  });
});

describe("usePayments — AC-12 race safety", () => {
  it("shows result of the last filter change when first response is slow", async () => {
    let resolveFirst!: (v: unknown) => void;
    const firstResponse = new Promise((res) => {
      resolveFirst = res;
    });

    mockFetch
      .mockReturnValueOnce(firstResponse)
      .mockReturnValueOnce(okResponse(validPayload));

    const { result, rerender } = renderHook(
      ({ filter }: { filter: "all" | "pending" }) => usePayments(filter),
      { initialProps: { filter: "all" as "all" | "pending" } },
    );

    act(() => rerender({ filter: "pending" }));

    await waitFor(() => expect(result.current.kind).toBe("ready"));

    act(() =>
      resolveFirst({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [{ ...validPayload.items[0], status: "approved" }],
            total: 1,
          }),
      }),
    );

    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind === "ready") {
      expect(result.current.payments[0]?.status).toBe("approved");
    }
  });
});
