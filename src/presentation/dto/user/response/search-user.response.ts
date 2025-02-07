import { ApiProperty } from '@nestjs/swagger';
import { FriendRequestStatus, User, UserCursor } from '../../shared';

class SearchedUser extends User {
  @ApiProperty({
    example: 'RECEIVED',
    description:
      '친구 요청 상태. 요청 보낸 상태: SENT, 받은 상태: RECEIVED, 요청 없는 상태: NONE',
    enum: ['SENT', 'RECEIVED', 'NONE'],
  })
  readonly status: FriendRequestStatus;
}

export class SearchUserResponse {
  @ApiProperty({ type: [SearchedUser] })
  readonly users: SearchedUser[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
