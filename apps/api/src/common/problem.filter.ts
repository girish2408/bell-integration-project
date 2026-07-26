import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

interface ProblemResponse {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
}

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{
      status: (code: number) => { setHeader: (k: string, v: string) => { json: (body: ProblemResponse) => void } };
    }>();
    const req = ctx.getRequest<{ url: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let title = "Internal Server Error";
    let detail: string | undefined;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === "object" && body !== null) {
        const b = body as Record<string, unknown>;
        title =
          typeof b["title"] === "string" ? b["title"] : exception.message;
        detail = typeof b["detail"] === "string" ? b["detail"] : undefined;
      } else {
        title = typeof body === "string" ? body : exception.message;
      }
    }

    res
      .status(status)
      .setHeader("Content-Type", "application/problem+json")
      .json({
        type: "about:blank",
        title,
        status,
        ...(detail !== undefined ? { detail } : {}),
        instance: req.url,
      });
  }
}
