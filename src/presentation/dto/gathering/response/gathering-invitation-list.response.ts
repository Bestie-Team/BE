import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user';

class GatheringInvitation {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly sender: string;

  @ApiProperty()
  readonly createdAt: string;

  @ApiProperty()
  readonly gatheringDate: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty({ type: [User] })
  readonly members: User[];
}

export class GatheringInvitationListResponse {
  @ApiProperty({ type: GatheringInvitation })
  readonly invitations: GatheringInvitation[];

  @ApiProperty({ type: 'string', nullable: true })
  readonly nextCursor: string | null;
}
