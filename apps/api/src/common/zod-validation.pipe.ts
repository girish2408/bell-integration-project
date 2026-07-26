import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import type { ArgumentMetadata } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    const issue = result.error.issues[0];
    const detail = buildDetail(issue, result.error);
    throw new BadRequestException({ title: "Invalid query parameter", detail });
  }
}

function buildDetail(
  issue: ZodError["issues"][number] | undefined,
  error: ZodError,
): string {
  if (!issue) return error.message;
  if (issue.code === "invalid_enum_value") {
    const field = issue.path[0] ?? "parameter";
    return `'${String(field)}' must be one of: ${issue.options.join(", ")}`;
  }
  return issue.message;
}
