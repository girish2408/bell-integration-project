import type { Payment } from "@pay/contracts";
import { formatMoney, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import styles from "./PaymentsTable.module.css";

interface Props {
  payments: Payment[];
}

export function PaymentsTable({ payments }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Payment ID</th>
            <th scope="col">Amount</th>
            <th scope="col">Currency</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className={styles.mono}>{p.id}</td>
              <td className={styles.amount}>
                {formatMoney(p.amountMinor, p.currency)}
              </td>
              <td>{p.currency}</td>
              <td>
                <StatusBadge status={p.status} />
              </td>
              <td>{formatDate(p.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
