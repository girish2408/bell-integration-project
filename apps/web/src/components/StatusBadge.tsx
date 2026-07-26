import type { PaymentStatus } from "@pay/contracts";
import styles from "./StatusBadge.module.css";

interface Props {
  status: PaymentStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
