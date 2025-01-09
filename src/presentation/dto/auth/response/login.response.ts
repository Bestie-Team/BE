import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty()
  readonly accessToken: string;
}
