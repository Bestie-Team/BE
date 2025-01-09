import { ApiProperty } from '@nestjs/swagger';

export class UserCursor {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly accountId: string;
}

export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';
export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';
