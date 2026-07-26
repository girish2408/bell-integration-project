import { MINOR_UNIT_EXPONENT } from "@pay/contracts";

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: MINOR_UNIT_EXPONENT,
    maximumFractionDigits: MINOR_UNIT_EXPONENT,
  }).format(amountMinor / Math.pow(10, MINOR_UNIT_EXPONENT));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
