import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdateNotificationTokenRequest {
  // TODO 토큰 검증
  @ApiProperty({ example: 'token' })
  @Length(1, 300)
  readonly token: string;
}
