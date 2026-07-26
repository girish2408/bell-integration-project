import { Injectable } from "@nestjs/common";
import type { PaymentListResponse, ListPaymentsQuery } from "@pay/contracts";
import { PaymentsRepository } from "./payments.repository";

@Injectable()
export class PaymentsService {
  constructor(private readonly repository: PaymentsRepository) {}

  listPayments(query: ListPaymentsQuery): PaymentListResponse {
    const all = this.repository.findAll();

    const filtered =
      query.status === "all"
        ? all
        : all.filter((p) => p.status === query.status);

    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { items: sorted, total: sorted.length };
  }
}
