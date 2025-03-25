import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReportTypes } from '../../shared';

export class CreateReportRequest {
  @ApiProperty({
    example: 'uuid',
    description:
      '신고 타입에 맞는 데이터의 id. 회원 신고: userId, 그룹 신고: groupId, 피드 신고: feedId',
  })
  @IsUUID(4, { message: 'reportedId가 uuid 형식이 아닙니다.' })
  readonly reportedId: string;

  @ApiProperty({ example: '자꾸 욕하고 조롱함.' })
  @MaxLength(200, { message: '신고 사유는 최대 200자까지 가능합니다.' })
  readonly reason: string;

  @ApiProperty({
    description: '신고 종류',
    type: 'string',
    enum: ['FRIEND', 'GROUP', 'FEED', 'FEED_COMMENT'],
    example: 'FRIEND',
  })
  @IsIn(['FRIEND', 'GROUP', 'FEED', 'FEED_COMMENT'], {
    message: 'type은 FRIEND, GROUP, FEED, FEED_COMMENT만 가능합니다.',
  })
  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  readonly type: ReportTypes;
}
