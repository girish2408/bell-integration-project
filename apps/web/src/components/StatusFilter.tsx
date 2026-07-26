import type { StatusFilter } from "@pay/contracts";
import { STATUS_FILTER_OPTIONS } from "@pay/contracts";
import styles from "./StatusFilter.module.css";

interface Props {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="status-filter" className={styles.label}>
        Filter by status
      </label>
      <select
        id="status-filter"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as StatusFilter)}
      >
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
