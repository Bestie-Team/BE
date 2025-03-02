import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { DateIdCursor } from '../../shared';

export class NotificationListRequest {
  @ApiProperty({
    type: DateIdCursor,
    description: '첫 번째 커서: { createdAt: 현재 날짜, id: uuid 아무 값이나 }',
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value);
      return plainToInstance(DateIdCursor, json);
    } catch (e) {
      throw new Error(`${value} 커서가 유효하지 않습니다.`);
    }
  })
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => DateIdCursor)
  readonly cursor: DateIdCursor;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
