import { ApiProperty } from '@nestjs/swagger';
import { UserCursor } from 'src/presentation/dto/shared/indexs';
import { User } from 'src/presentation/dto/user/response/data.types';

export class SearchUserResponse {
  @ApiProperty({ type: User })
  readonly users: User[];

  @ApiProperty({ type: UserCursor })
  readonly nextCursor: UserCursor | null;
}
