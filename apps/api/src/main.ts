import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ProblemFilter } from "./common/problem.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new ProblemFilter());
  const port = Number(process.env["PORT"]) || 3000;
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
