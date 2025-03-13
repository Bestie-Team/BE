import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';
import { BadRequestException } from 'src/domain/error/exceptions/bad-request.exception';
import { ConflictException } from 'src/domain/error/exceptions/conflice.exception';
import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import { NotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import { UnprocessableException } from 'src/domain/error/exceptions/unprocessable.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception Filter');

  @SentryExceptionCaptured()
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = this.getHttpStatusFromException(exception);
    const responseBody = this.getResponseBodyFromException(exception, status);

    const message = this.generateMessage(req);

    process.env.NODE_ENV !== 'test' &&
      this.logger.warn(
        JSON.stringify({ ...message, errorBody: responseBody }, null, 2),
      );

    const body = {
      ...(status === 500
        ? { message: 'Server error' }
        : typeof responseBody === 'object'
        ? responseBody
        : { message: responseBody }),
      timestamp: new Date().toISOString(),
    };

    res.status(status).json(body);
  }

  private getHttpStatusFromException(exception: Error): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (exception instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof UnprocessableException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (exception instanceof ConflictException) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getResponseBodyFromException(exception: Error, status: number) {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }
    if (exception instanceof DomainException) {
      let response = {
        message: exception.message,
        statusCode: status,
        error: exception.name,
      };

      if ('body' in exception && exception['body']) {
        if (typeof exception['body'] === 'object') {
          response = {
            ...response,
            ...exception['body'],
          };
        }
      }

      return response;
    }
    return {
      message: exception.message,
      statusCode: status,
      error: 'Internal Server Error',
    };
  }

  generateMessage(req: Request) {
    const { ip, path, body, params, query, method } = req;
    const agent = req.header('user-agent') || 'unknown';
    const referer = req.header('referer') || 'unknown';

    return {
      agent,
      ip,
      request: `${method} ${path}`,
      referer,
      body,
      params,
      query,
    };
  }
}
