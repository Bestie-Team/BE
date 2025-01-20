import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../shared';

export class Group {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty({
    example: '3',
    description: '해당 그룹으로 모임을 한 횟수.',
  })
  readonly gatheringCount: number;

  @ApiProperty()
  readonly groupImageUrl: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '그룹에 합류한 날짜.',
  })
  readonly joinDate: string;

  @ApiProperty({ type: User })
  readonly owner: User;

  @ApiProperty({ type: [User] })
  readonly members: User[];
}

export class GroupListResponse {
  @ApiProperty({ type: [Group] })
  readonly groups: Group[];

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  readonly nextCursor: string | null;
}
