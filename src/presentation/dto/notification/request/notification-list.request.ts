import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { DateIdCursor } from '../../shared';

export class NotificationListRequest {
  @ApiProperty({ example: 'uuid' })
  userId: string;

  @ApiProperty({
    type: DateIdCursor,
    description: '첫 번째 커서: { createdAt: 현재 날짜, id: uuid 아무 값이나 }',
  })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value);
      return plainToInstance(DateIdCursor, json);
    } catch (e) {
      throw new Error('커서 값을 파싱하는 데 실패했습니다.');
    }
  })
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => DateIdCursor)
  readonly cursor: DateIdCursor;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'limit이 정수가 아닙니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
