import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt } from 'class-validator';

export class UserCursor {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly accountId: string;
}

export class PaginationRequest {
  @ApiProperty()
  @IsDateString()
  readonly cursor: string;

  @ApiProperty()
  @IsInt({ message: 'limit은 정수만 가능합니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}

export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';
export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';
export type GatheringType = 'GROUP' | 'FRIEND';
