import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddGroupMemberRequest {
  @ApiProperty()
  @IsUUID(4, { message: '회원 번호 형식이 맞지 않습니다.' })
  readonly userId: string;
}
