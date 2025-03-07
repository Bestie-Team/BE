import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../shared';

export class GatheringDetailResponse {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly gatheringDate: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty({ description: '모임을 생성한 회원' })
  readonly hostUser: User;

  @ApiProperty({ type: [User] })
  readonly members: User[];
}
