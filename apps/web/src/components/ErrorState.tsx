import styles from "./ErrorState.module.css";

interface Props {
  message: string;
  retry: () => void;
}

export function ErrorState({ message, retry }: Props) {
  return (
    <div className={styles.wrapper} role="alert">
      <p className={styles.message}>Could not load payments: {message}</p>
      <button className={styles.retryBtn} onClick={retry} type="button">
        Retry
      </button>
    </div>
  );
}
