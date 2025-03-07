import { ApiOperation, ApiQuery } from '@nestjs/swagger';

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

export const ApiFileOperation = () => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiOperation({
      summary: '이미지 업로드',
      description: '이미지 최대 용량 4MB',
    })(target, propertyKey, descriptor);
  };
};
