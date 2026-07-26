import { PaymentListResponseSchema } from "@pay/contracts";
import type { PaymentListResponse, StatusFilter } from "@pay/contracts";

export async function fetchPayments(
  status: StatusFilter,
  signal: AbortSignal,
): Promise<PaymentListResponse> {
  const url =
    status === "all" ? "/api/payments" : `/api/payments?status=${status}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = PaymentListResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Response did not match the expected schema");
  }

  return parsed.data;
}
