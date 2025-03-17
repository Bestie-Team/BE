import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { BadRequestException } from 'src/domain/error/exceptions/bad-request.exception';
import { ConflictException } from 'src/domain/error/exceptions/conflice.exception';
import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import { NotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import { UnprocessableException } from 'src/domain/error/exceptions/unprocessable.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  @SentryExceptionCaptured()
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = this.getHttpStatusFromException(exception);
    const responseBody = this.getResponseBodyFromException(exception, status);

    const message = this.generateMessage(req);

    this.logging(status, message, responseBody);

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

  private logging(
    status: HttpStatus,
    message: ReturnType<typeof this.generateMessage>,
    errorBody: string | object,
  ) {
    if (process.env.NODE_ENV === 'test') return;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ ...message, errorBody });
      return;
    }

    this.logger.warn({ ...message, errorBody });
  }

  private getHttpStatusFromException(exception: Error): HttpStatus {
    if (exception instanceof HttpException) {
      return exception.getStatus() as HttpStatus;
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
      timestamp: new Date().toISOString(),
    };
  }
}
