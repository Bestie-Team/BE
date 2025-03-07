import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFriendRequest {
  @ApiProperty({ description: '요청을 보낼 회원 번호' })
  @IsUUID()
  readonly userId: string;
}
