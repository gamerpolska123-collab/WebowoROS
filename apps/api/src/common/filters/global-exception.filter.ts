import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} — ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      const status = this.getPrismaErrorStatus(exception.code);
      const message = this.getPrismaErrorMessage(exception.code, exception.meta);
      return response.status(status).json({
        statusCode: status,
        message,
        code: exception.code,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Zod validation errors
    if (exception instanceof ZodError) {
      const issues = exception.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return response.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: issues,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json({
        statusCode: status,
        ...(typeof res === 'string' ? { message: res } : res),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Unknown errors — internal server error
    this.logger.error('Unhandled exception', exception);
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getPrismaErrorStatus(code: string): number {
    switch (code) {
      case 'P2002': // Unique constraint violation
        return 409;
      case 'P2025': // Record not found
        return 404;
      case 'P2003': // Foreign key constraint
        return 400;
      case 'P2014': // Invalid ID
        return 400;
      default:
        return 500;
    }
  }

  private getPrismaErrorMessage(code: string, meta?: Record<string, unknown>): string {
    switch (code) {
      case 'P2002':
        return `Unique constraint violation on field: ${meta?.target || 'unknown'}`;
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return `Foreign key constraint failed on field: ${meta?.field_name || 'unknown'}`;
      default:
        return 'Database error';
    }
  }
}
