import { ApiProperty } from '@nestjs/swagger';
import { FriendRequest } from 'src/presentation/dto/friend/response/data.types';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export class FriendRequestListResponse {
  @ApiProperty({ type: FriendRequest })
  readonly requests: FriendRequest[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
