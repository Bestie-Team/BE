import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user';

export class Group {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly gatheringCount: number;

  @ApiProperty()
  readonly groupImageUrl: string;

  @ApiProperty({ type: User })
  readonly owner: User;

  @ApiProperty({ type: [User] })
  readonly members: User[];
}

export class GroupListReponse {
  @ApiProperty({ type: [Group] })
  readonly groups: Group[];

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  readonly nextCursor: string | null;
}
