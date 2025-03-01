import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '../../shared';

export class UserProfileResponse {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: '최은제' })
  readonly name: string;

  @ApiProperty({ example: 'lighty@gmail.com' })
  readonly email: string;

  @ApiProperty({
    example: 'GOOGLE',
    enum: ['GOOGLE', 'KAKAO', 'APPLE'],
  })
  readonly provider: Provider;

  @ApiProperty({ example: 'bad_orange' })
  readonly accountId: string;

  @ApiProperty({
    example: 'https://cdn.lighty.today/image.com',
    nullable: true,
    type: 'string',
  })
  readonly profileImageUrl: string | null;

  @ApiProperty({ example: 4, description: '읽지 않은 알림 수.' })
  readonly newNotificationCount: number;

  @ApiProperty({
    example: 7,
    description: '읽지 않은 초대장 수.',
  })
  readonly newInvitationCount: number;

  @ApiProperty({
    example: true,
    description: '작성한 피드가 하나라도 존재하지는지 여부.',
  })
  readonly hasFeed: boolean;
}
