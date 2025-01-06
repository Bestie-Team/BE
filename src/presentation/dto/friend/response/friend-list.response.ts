import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/domain/types/user.types';
import { UserCursor } from 'src/presentation/dto/shared/indexs';

export class FriendListResponse {
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
