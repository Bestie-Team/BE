import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../shared';

export class FeedCommentResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ type: User })
  readonly writer: User;

  @ApiProperty({ example: '나야 댓글' })
  readonly content: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  readonly createdAt: string;

  @ApiProperty({ type: User, description: '멘션된 사용자 정보' })
  readonly mentionedUser: User | null;
}
