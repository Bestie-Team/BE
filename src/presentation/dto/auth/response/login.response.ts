import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: '토큰' })
  readonly accessToken: string;

  @ApiProperty({ example: 'bad_orange' })
  readonly accountId: string;

  @ApiProperty({ type: 'string', nullable: true })
  readonly profileImageUrl: string | null;
}
