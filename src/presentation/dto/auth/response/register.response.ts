import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: '톡흔' })
  readonly accessToken: string;

  @ApiProperty({ example: 'bad_orange' })
  readonly accountId: string;
}
