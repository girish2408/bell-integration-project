import { Injectable } from "@nestjs/common";
import type { Payment } from "@pay/contracts";
import { SEED_PAYMENTS } from "./payments.seed";

@Injectable()
export class PaymentsRepository {
  findAll(): Payment[] {
    return [...SEED_PAYMENTS];
  }
}
