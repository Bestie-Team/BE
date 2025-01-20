import { ApiProperty } from '@nestjs/swagger';
import { User, UserCursor } from '../../shared';

export class FriendRequest {
  @ApiProperty()
  readonly id: string;

  @ApiProperty({ type: User })
  readonly sender: User;
}

export class FriendRequestListResponse {
  @ApiProperty({ type: [FriendRequest] })
  readonly requests: FriendRequest[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
