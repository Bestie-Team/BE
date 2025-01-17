import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'lighty_123' })
  readonly accountId: string;

  @ApiProperty({ example: '김해성' })
  readonly name: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'https://cdn.lighty.today/image.png',
  })
  readonly profileImageUrl: string | null;
}
