import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/common/domain-exception.base';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred.';
    let details: any[] = [];

    if (exception instanceof DomainException) {
      statusCode = exception.statusCode;
      errorCode = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'object' && resp !== null) {
        errorCode = (resp as any).error || exception.name;
        message = (resp as any).message || exception.message;
        if (Array.isArray((resp as any).message)) {
          details = (resp as any).message;
          message = details.length > 0 ? details.join('; ') : 'Request validation failed.';
        }
      } else {
        message = resp as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    const correlationId = request.headers['x-correlation-id'] || 'N/A';

    response.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId,
      },
    });
  }
}
