import { ApiProperty } from '@nestjs/swagger';
import { Gathering } from './gathering-list.response';
import { DateIdCursor } from '../../shared';

class EndedGathering extends Gathering {
  @ApiProperty({ example: true, description: '자신의 피드 작성 여부' })
  readonly isFeedPosted: boolean;
}

export class EndedGatheringsListResponse {
  @ApiProperty({ type: [EndedGathering] })
  readonly gatherings: EndedGathering[];
  @ApiProperty({ type: 'string', nullable: true })
  readonly nextCursor: DateIdCursor | null;
}
