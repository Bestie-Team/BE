import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly accountId: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: 'string', nullable: true })
  readonly profileImageUrl: string | null;
}
