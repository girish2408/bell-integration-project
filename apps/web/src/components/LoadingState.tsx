import styles from "./LoadingState.module.css";

export function LoadingState() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Loading payments…</span>
    </div>
  );
}
