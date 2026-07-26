import { Controller, Get, Query } from "@nestjs/common";
import type { PaymentListResponse, ListPaymentsQuery } from "@pay/contracts";
import { ListPaymentsQuerySchema } from "@pay/contracts";
import { PaymentsService } from "./payments.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ListPaymentsQuerySchema))
    query: ListPaymentsQuery,
  ): PaymentListResponse {
    return this.service.listPayments(query);
  }
}
