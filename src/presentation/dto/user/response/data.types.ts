import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly accountId: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly profileImageUrl: string;
}
