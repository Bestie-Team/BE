import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  readonly logger: Logger = new Logger('Logging Interceptor');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const message = this.generateMessage(req, res);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        if (process.env.NODE_ENV !== 'test') {
          this.logger.log(`${message} \nduration: ${duration}ms`);
        }
      }),
    );
  }

  private generateMessage(req: Request, res: Response) {
    const { ip, path, body, params, query, method } = req;
    const userAgent = req.header('user-agent') || 'unknown';
    const referer = req.header('referer') || 'unknown';
    const status = res.statusCode;

    const userAgentMsg = `\nagent: ${JSON.stringify(userAgent, null, 2)}`;
    const ipMsg = `\nip: ${JSON.stringify(ip, null, 2)}`;
    const requestMsg = `\nrequest: ${method} ${path}`;
    const refererMsg = `\nreferer: ${JSON.stringify(referer, null, 2)}`;
    const bodyMsg = `\nbody: ${JSON.stringify(body, null, 2)}`;
    const paramsMsg = `\nparams: ${JSON.stringify(params, null, 2)}`;
    const queryMsg = `\nquery: ${JSON.stringify(query, null, 2)}`;
    const statusMsg = `\nstatus: ${status}`;

    return `${userAgentMsg}${ipMsg}${requestMsg}${refererMsg}${bodyMsg}${paramsMsg}${queryMsg}${statusMsg}`;
  }
}
