import { ApiProperty } from '@nestjs/swagger';
import { UserCursor } from 'src/presentation/dto/shared';
import { User } from 'src/presentation/dto/user/response/data.types';

export class FriendListResponse {
  @ApiProperty({ type: User })
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
