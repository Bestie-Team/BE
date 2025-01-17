import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Order } from '../../shared';

export class FeedCursor {
  @ApiProperty()
  @IsDateString({}, { message: 'createdAt이 ISO8601 형식이 아닙니다.' })
  readonly createdAt: string;

  @ApiProperty()
  @IsUUID(4, { message: 'id가 UUID가 아닙니다' })
  readonly id: string;
}
// NOTE DTO 업데이트
export class FeedListRequest {
  @ApiProperty({
    description: 'DESC: 내림차순, ASC: 오름차순',
    type: 'string',
    enum: ['DESC', 'ACS'],
    example: 'DESC',
  })
  @IsIn(['DESC', 'ASC'], { message: 'order는 DESC, ASC만 가능합니다.' })
  readonly order: Order;

  @ApiProperty({ description: 'minDate도 검색 결과에 포함돼요.' })
  @IsDateString({}, { message: 'minDate가 ISO8601 형식이 아닙니다.' })
  readonly minDate: string;

  @ApiProperty({ description: 'maxDate도 검색 결과에 포함돼요.' })
  @IsDateString({}, { message: 'maxDate가 ISO8601 형식이 아닙니다.' })
  readonly maxDate: string;

  @ApiProperty({
    type: FeedCursor,
    description:
      '첫 번째 커서: { createdAt: DESC일 때는 maxDate ACS일 때는 minDate, id: uuid 아무 값이나 }',
  })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value); // 문자열을 객체로 변환
      return plainToInstance(FeedCursor, json);
    } catch (e) {
      throw new Error('커서 값을 파싱하는 데 실패했습니다.');
    }
  })
  @ValidateNested({ message: '커서가 유효하지 않습니다.' })
  @Type(() => FeedCursor)
  readonly cursor: FeedCursor;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'limit이 정수가 아닙니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}
