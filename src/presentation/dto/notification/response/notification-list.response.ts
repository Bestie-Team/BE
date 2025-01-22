import { ApiProperty } from '@nestjs/swagger';
import { DateIdCursor } from '../../shared';

export type NotificationTypes =
  | 'GATHERING_INVITATION_RECEIVED'
  | 'GATHERING_INVITATION_ACCEPTED'
  | 'GROUP_INVITATION'
  | 'FRIEND_REQUEST'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'FEED_COMMENT';

export class Notification {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'uuid' })
  readonly userId: string;

  @ApiProperty({
    example: 'FRIEND_REQUEST',
    description: '알림 종류입니다. 추가될 가능성 농후...',
    enum: [
      'GATHERING_INVITATION',
      'GATHERING_INVITATION_ACCEPTED',
      'GROUP_INVITATION',
      'FRIEND_REQUEST',
      'FRIEND_REQUEST_ACCEPTED',
      'FEED_COMMENT',
    ],
  })
  readonly type: NotificationTypes;

  @ApiProperty({ example: '지금 접속하면 스티커 24종이 무료?' })
  readonly title: string;

  @ApiProperty({ example: '거짓말입니다~' })
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

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  readonly createdAt: string;
}

export class NotificationListResponse {
  @ApiProperty({ type: [Notification] })
  readonly notifications: Notification[];

  @ApiProperty({ type: DateIdCursor, nullable: true })
  readonly nextCursor: DateIdCursor | null;
}
