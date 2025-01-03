import { Module, Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';

const filters: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },
];

@Module({
  providers: [...filters],
})
export class FiltersModule {}
