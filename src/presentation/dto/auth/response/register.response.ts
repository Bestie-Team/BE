import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly accountId: string;
}
