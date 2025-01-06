import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/presentation/dto/user/response/data.types';

export class FriendRequest {
  @ApiProperty()
  readonly id: string;

  @ApiProperty({ type: User })
  readonly sender: User;
}
