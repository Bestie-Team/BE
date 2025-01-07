import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  readonly logger: Logger = new Logger('Logging Interceptor');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const message = this.generateMessage(req);

    return next
      .handle()
      .pipe(
        tap(() => process.env.NODE_ENV !== 'test' && this.logger.log(message)),
      );
  }

  private generateMessage(req: Request) {
    const { ip, path, body, params, query, method } = req;
    const ipMsg = `\nip: ${JSON.stringify(ip, null, 2)}`;
    const pathMsg = `\npath: ${JSON.stringify(path, null, 2)}`;
    const methodMsg = `\nmethod: ${JSON.stringify(method, null, 2)}`;
    const bodyMsg = `\nbody: ${JSON.stringify(body, null, 2)}`;
    const paramsMsg = `\nparams: ${JSON.stringify(params, null, 2)}`;
    const queryMsg = `\nquery: ${JSON.stringify(query, null, 2)}`;

    return `${ipMsg}${pathMsg}${methodMsg}${bodyMsg}${paramsMsg}${queryMsg}`;
  }
}
