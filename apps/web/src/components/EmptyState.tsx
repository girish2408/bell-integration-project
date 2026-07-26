import type { StatusFilter } from "@pay/contracts";
import styles from "./EmptyState.module.css";

interface Props {
  filter: StatusFilter;
}

function filterLabel(filter: StatusFilter): string {
  return filter === "all" ? "any status" : `status "${filter}"`;
}

export function EmptyState({ filter }: Props) {
  return (
    <div className={styles.wrapper}>
      <p>No payments found with {filterLabel(filter)}.</p>
    </div>
  );
}
