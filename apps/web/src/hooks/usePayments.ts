import { useState, useEffect } from "react";
import type { Payment, StatusFilter } from "@pay/contracts";
import { fetchPayments } from "../lib/api";

export type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string; retry: () => void }
  | { kind: "empty"; filter: StatusFilter }
  | { kind: "ready"; payments: Payment[] };

export function usePayments(filter: StatusFilter): ViewState {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setState({ kind: "loading" });
    const ac = new AbortController();

    fetchPayments(filter, ac.signal)
      .then((data) => {
        if (data.items.length === 0) {
          setState({ kind: "empty", filter });
        } else {
          setState({ kind: "ready", payments: data.items });
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setState({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Something went wrong.",
          retry: () => setRetryCount((n) => n + 1),
        });
      });

    return () => ac.abort();
  }, [filter, retryCount]);

  return state;
}
