import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/response/data.types';
import { UserCursor } from '../../shared';

export class FriendListResponse {
  @ApiProperty({ type: User })
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
