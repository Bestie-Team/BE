import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { FeedCursor } from './feed-list.request';

export class BlockedFeedListRequest {
  @ApiProperty({
    type: FeedCursor,
    description: '첫 번째 커서: { createdAt: 현재 날짜, id: uuid 아무 값이나 }',
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
