import { ApiProperty } from '@nestjs/swagger';
import { DateIdCursor } from '../../shared';

export class Gathering {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly gatheringDate: string;

  @ApiProperty()
  readonly invitationImageUrl: string;
}

export class GatheringListResponse {
  @ApiProperty({ type: [Gathering] })
  readonly gatherings: Gathering[];

  @ApiProperty({ type: 'string', nullable: true })
  readonly nextCursor: DateIdCursor | null;
}
