import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class ChangeAccountIdRequest {
  @ApiProperty()
  @Length(5, 15, { message: '계정 아이디는 최소 5자 최대 15자만 가능합니다.' })
  readonly accountId: string;
}
