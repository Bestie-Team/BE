import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestCountResponse {
  @ApiProperty({ example: 3 })
  readonly count: number;
}
