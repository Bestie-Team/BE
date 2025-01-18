import { ApiProperty } from '@nestjs/swagger';

export class UserDetailResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'lighty_1' })
  readonly accountId: string;

  @ApiProperty({ example: '김철수' })
  readonly name: string;

  @ApiProperty({ example: 'https://cdn.lighty.today/imaeg.jpg' })
  readonly profileImageUrl: string | null;

  @ApiProperty({ example: 5 })
  readonly groupCount: number;

  @ApiProperty({ example: 12 })
  readonly feedCount: number;

  @ApiProperty({ example: 52 })
  readonly friendCount: number;
}
