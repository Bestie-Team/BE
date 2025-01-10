import { ApiProperty } from '@nestjs/swagger';
import { User } from './data.types';
import { UserCursor } from '../../shared';

export class SearchUserResponse {
  @ApiProperty({ type: User })
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
