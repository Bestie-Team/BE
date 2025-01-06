import { ApiProperty } from '@nestjs/swagger';

export class UserCursor {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly accountId: string;
}
