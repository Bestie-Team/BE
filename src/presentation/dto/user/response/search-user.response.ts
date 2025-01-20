import { ApiProperty } from '@nestjs/swagger';
import { User, UserCursor } from '../../shared';

export class SearchUserResponse {
  @ApiProperty({ type: [User] })
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
