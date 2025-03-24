import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class WithdrawRequest {
  @ApiProperty({
    description: '애플 로그인으로 가입된 회원일 경우에만 사용.',
  })
  @IsOptional()
  readonly authorizationCode?: string;
}
