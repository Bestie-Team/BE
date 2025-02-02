import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly accountId: string;

  @ApiProperty({ type: 'string', nullable: true })
  readonly profileImageUrl: string | null;
}
