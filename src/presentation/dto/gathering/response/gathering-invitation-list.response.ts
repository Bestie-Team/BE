import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user';

class GatheringInvitation {
  @ApiProperty()
  readonly id: string;

  @ApiProperty({
    example: '두리 집 청소 모임',
    description: '초대 주체 모임의 이름.',
  })
  readonly name: string;

  @ApiProperty({
    example: '두리 집 청소 모임입니다.',
    description: '초대 주체 모임의 소개.',
  })
  readonly description: string;

  @ApiProperty({
    example: 'love_orange',
    description: '초대 보낸 회원의 계정 아이디.',
  })
  readonly sender: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '모임 초대를 보낸 혹은 받은 날짜.',
  })
  readonly createdAt: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '모임일.',
  })
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
