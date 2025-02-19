import { ApiProperty } from '@nestjs/swagger';
import { DateIdCursor } from '../../shared';

class SentGatheringInvitation {
  @ApiProperty({ example: 'uuid' })
  readonly gatheringId: string;

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

  @ApiProperty({ example: 'https://cdn.lighty.today/image.jpg' })
  readonly invitation_image_url: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty({
    type: 'string',
    example: '이름 혹은 null',
    description: '그룹 모임일 경우 그룹 이름, 아닐 경우 null',
    nullable: true,
  })
  readonly groupName: string | null;
}

export class SentGatheringInvitationListResponse {
  @ApiProperty({ type: SentGatheringInvitation })
  readonly invitations: SentGatheringInvitation[];

  @ApiProperty({ type: 'string', nullable: true })
  readonly nextCursor: DateIdCursor | null;
}
