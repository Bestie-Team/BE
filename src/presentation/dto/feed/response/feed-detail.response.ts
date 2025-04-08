import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../shared';
import { Gathering } from '../../gathering';

export class FeedDetailResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: '우와 정말 재밌었다~~' })
  readonly content: string;

  @ApiProperty({
    example: [
      'https://cdn.lighty.today/feed/image/image1.jpg',
      'https://cdn.lighty.today/feed/image/image2.jpg',
      'https://cdn.lighty.today/feed/image/image3.jpg',
    ],
  })
  readonly images: string[];

  @ApiProperty()
  readonly commentCount: number;

  @ApiProperty()
  readonly writer: User;

  @ApiProperty({ example: '2024-12-28T00:00:00.000Z' })
  readonly createdAt: string;

  @ApiProperty({ type: () => Gathering, nullable: true })
  readonly gathering: Gathering | null;

  @ApiProperty({
    type: () => [User],
    description: '모임 피드에서는 모임원, 일반 피드에서는 공개한 친구.',
  })
  readonly withMembers: User[];
}
