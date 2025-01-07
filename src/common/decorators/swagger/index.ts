import { ApiQuery } from '@nestjs/swagger';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export const ApiUserPaginationQuery = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({
      name: 'cursor',
      type: UserCursor,
      example: 'abc123',
    })(target, propertyKey, descriptor);
    ApiQuery({ name: 'limit', type: 'number', example: 10 })(
      target,
      propertyKey,
      descriptor,
    );
  };
};
