import { ApiQuery } from '@nestjs/swagger';
import { UserCursor } from 'src/presentation/dto';

export const ApiUserPaginationQuery = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // ApiQuery({
    //   name: 'cursor',
    //   type: UserCursor,
    //   description: `첫 번째 요청 cursor: ${JSON.stringify(
    //     { name: '가', accountId: 'a' },
    //     null,
    //     2,
    //   )}`,
    // })(target, propertyKey, descriptor);
    // ApiQuery({ name: 'limit', type: 'number', example: 10 })(
    //   target,
    //   propertyKey,
    //   descriptor,
    // );
  };
};

export const ApiGroupPaginationQuery = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({
      name: 'cursor',
      description: '첫 커서는 현재 날짜로 보내주세요.',
      example: '2025-01-01T00:00:00.000Z',
    })(target, propertyKey, descriptor);
    ApiQuery({ name: 'limit', type: 'number', example: 10 })(
      target,
      propertyKey,
      descriptor,
    );
  };
};

export const ApiGatheringPaginationQuery = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({
      name: 'cursor',
      description: '첫 커서는 현재 날짜로 보내주세요.',
      example: '2025-01-01T00:00:00.000Z',
    })(target, propertyKey, descriptor);
    ApiQuery({
      name: 'minDate',
      description: 'minDate도 검색 결과에 포함돼요.',
      example: '2024-12-31T15:00:00.000Z',
    })(target, propertyKey, descriptor);
    ApiQuery({
      name: 'maxDate',
      description: 'maxDate도 검색 결과에 포함돼요.',
      example: '2024-12-31T15:00:00.000Z',
    })(target, propertyKey, descriptor);
    ApiQuery({ name: 'limit', type: 'number', example: 10 })(
      target,
      propertyKey,
      descriptor,
    );
  };
};
