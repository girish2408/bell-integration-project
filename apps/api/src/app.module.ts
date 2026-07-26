import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { PaymentsModule } from "./payments/payments.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    PaymentsModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "web", "dist"),
      exclude: ["/api/{*path}"],
    }),
  ],
})
export class AppModule {}
