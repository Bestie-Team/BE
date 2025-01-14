import { ApiProperty } from '@nestjs/swagger';
import { FriendRequest } from './data.types';
import { UserCursor } from '../../shared';

export class FriendRequestListResponse {
  @ApiProperty({ type: [FriendRequest] })
  readonly requests: FriendRequest[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
