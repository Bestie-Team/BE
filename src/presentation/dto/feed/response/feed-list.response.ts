import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user';
import { FeedCursor } from '../request/feed-list.request';

class Gathering {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly gatheringDate: Date;

  @ApiProperty({ type: [User] })
  readonly members: User[];
}

export class Feed {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
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

  @ApiProperty()
  readonly createdAt: string;

  @ApiProperty({ type: Gathering, nullable: true })
  readonly gathering: Gathering | null;
}

export class FeedListResponse {
  @ApiProperty({ type: [Feed] })
  readonly feeds: Feed[];

  @ApiProperty({ type: FeedCursor })
  readonly nextCursor: FeedCursor | null;
}
