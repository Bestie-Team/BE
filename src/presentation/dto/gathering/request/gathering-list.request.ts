import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class GatheringCursor {
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString({}, { message: 'createdAt이 ISO8601 형식이 아닙니다.' })
  readonly createdAt: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID(4, { message: 'id가 UUID가 아닙니다' })
  readonly id: string;
}

export class GatheringListRequest {
  @ApiProperty()
  @IsDateString({}, { message: 'minDate가 ISO8601 형식이 아닙니다.' })
  minDate: string;

  @ApiProperty()
  @IsDateString({}, { message: 'maxDate가 ISO8601 형식이 아닙니다.' })
  maxDate: string;

  @ApiProperty({
    type: GatheringCursor,
    description: '첫 번째 커서: { createdAt: maxDate, id: uuid 아무 값이나 }',
  })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value); // 문자열을 객체로 변환
      return plainToInstance(GatheringCursor, json);
    } catch (e) {
      throw new Error(`${value} invalid cursor.`);
    }
  })
  @IsNotEmpty()
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => GatheringCursor)
  readonly cursor: GatheringCursor;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'limit이 정수가 아닙니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
