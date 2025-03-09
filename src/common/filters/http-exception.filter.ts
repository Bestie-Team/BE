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
import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import { NotFoundException } from 'src/domain/error/exceptions/not-found.exception';

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

    const reqMessage = this.generateRequestMessage(req);

    process.env.NODE_ENV !== 'test' &&
      this.logger.warn(
        `${reqMessage}\nerrorBody: ${JSON.stringify(responseBody, null, 2)}`,
      );

    const body =
      typeof responseBody === 'object'
        ? {
            ...responseBody,
            timestamp: new Date().toISOString(),
          }
        : {
            message: responseBody,
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
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getResponseBodyFromException(exception: Error, status: number) {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }
    if (exception instanceof DomainException) {
      // 기본 형식의 응답 객체 생성
      const response = {
        message: exception.message,
        statusCode: status,
        error: exception.name,
      };

      // if ('data' in exception && exception['data'] !== undefined) {
      //   response['data'] = exception['data'];
      // }

      return response;
    }
    return {
      message: exception.message,
      statusCode: status,
      error: 'Internal Server Error',
    };
  }

  generateRequestMessage(req: Request) {
    const { body, params, query, ip, method, url } = req;

    const methodMessage = `\nmethod: ${method}`;
    const urlMessage = `\nurl: ${url}`;
    const ipMessage = `\nip: ${ip}`;
    const paramMessage = params
      ? ` \nparams: ${JSON.stringify(params, null, 2)}`
      : '';
    const queryMessage = query
      ? ` \nquery: ${JSON.stringify(query, null, 2)}`
      : '';
    const bodyMessage = body ? ` \nbody: ${JSON.stringify(body, null, 2)}` : '';

    return `${methodMessage}${urlMessage}${ipMessage}${paramMessage}${queryMessage}${bodyMessage}`;
  }
}
