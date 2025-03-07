import { ApiProperty } from '@nestjs/swagger';

export class RefreshAccessResponse {
  @ApiProperty()
  readonly accessToken: string;
}
