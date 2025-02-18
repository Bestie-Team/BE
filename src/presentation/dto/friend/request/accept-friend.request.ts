import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AccepFriendRequest {
  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  readonly friendId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  readonly senderId: string;
}
