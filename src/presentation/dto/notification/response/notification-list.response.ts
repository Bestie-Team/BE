import { ApiProperty } from '@nestjs/swagger';
import { DateIdCursor } from '../../shared';

export class Notification {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'uuid' })
  readonly userId: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly message: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'uuid OR null',
    description: '연관된 데이터의 id인데 지금은 있다면 feedId 뿐입니다.',
  })
  readonly relatedId: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: '2025-01-01T00:00:00.000Z OR null',
    description: '이 값이 null이면 아직 읽지 않은 겁니다.',
  })
  readonly readAt: string | null;

  @ApiProperty()
  readonly createdAt: string;
}

export class NotificationListResponse {
  @ApiProperty({ type: [Notification] })
  readonly notifications: Notification[];

  @ApiProperty({ type: DateIdCursor, nullable: true })
  readonly nextCursor: DateIdCursor | null;
}
