import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception Filter');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    let status: number;
    let responseBody;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        message: exception.message,
        statusCode: status,
        error: 'Internal Server Error',
      };
    }

    const reqMessage = this.generateRequestMessage(req);

    process.env.NODE_ENV !== 'test' &&
      this.logger.warn(
        `${reqMessage}\nerrorBody: ${JSON.stringify(responseBody, null, 2)}`,
      );

    res.status(status).json({
      ...responseBody,
      timestamp: new Date().toISOString(),
    });
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
