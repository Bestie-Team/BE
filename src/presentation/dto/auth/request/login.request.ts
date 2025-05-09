import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: '소셜 플랫폼 회원 정보 요청을 위한 access token',
  })
  @IsString()
  readonly accessToken: string;
}
