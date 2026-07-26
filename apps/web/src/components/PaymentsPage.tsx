import { useState } from "react";
import type { StatusFilter } from "@pay/contracts";
import { usePayments } from "../hooks/usePayments";
import { StatusFilter as StatusFilterCtrl } from "./StatusFilter";
import { PaymentsTable } from "./PaymentsTable";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import styles from "./PaymentsPage.module.css";

export function PaymentsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const state = usePayments(filter);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Payments</h1>
        <StatusFilterCtrl value={filter} onChange={setFilter} />
      </header>

      <main className={styles.content}>
        {(() => {
          switch (state.kind) {
            case "loading":
              return <LoadingState />;
            case "error":
              return (
                <ErrorState message={state.message} retry={state.retry} />
              );
            case "empty":
              return <EmptyState filter={state.filter} />;
            case "ready":
              return <PaymentsTable payments={state.payments} />;
            default: {
              const _exhaustive: never = state;
              return _exhaustive;
            }
          }
        })()}
      </main>
    </div>
  );
}
