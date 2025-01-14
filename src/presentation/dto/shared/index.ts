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
  @IsDateString({}, { message: 'cursor가 ISO8601이 아닙니다.' })
  readonly cursor: string;

  @ApiProperty()
  @IsInt({ message: 'limit이 정수가 아닙니다.' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  readonly limit: number;
}

export type Provider = 'GOOGLE' | 'KAKAO' | 'APPLE';
export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPORTED';
export type GatheringType = 'GROUP' | 'FRIEND';
