import { ApiQuery } from '@nestjs/swagger';
import { UserCursor } from 'src/presentation/dto';

export const ApiUserPaginationQuery = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({
      name: 'cursor',
      type: UserCursor,
    })(target, propertyKey, descriptor);
    ApiQuery({ name: 'limit', type: 'number', example: 10 })(
      target,
      propertyKey,
      descriptor,
    );
  };
};
