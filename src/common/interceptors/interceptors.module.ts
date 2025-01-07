import { Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

const interceptors: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
];

@Module({
  providers: [...interceptors],
})
export class InterceptorsModule {}
