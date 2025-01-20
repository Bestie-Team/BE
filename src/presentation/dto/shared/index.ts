import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt } from 'class-validator';

/**
 * 모든 회원 타입이 공통으로 가지는 최소한의 타입.<br/>
 *
 * 주로 회원 아이콘에서 사용
 *
 * { id, accountId, name, profileImageUrl }
 */
export class User {
  @ApiProperty({ example: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'lighty_123' })
  readonly accountId: string;

  @ApiProperty({ example: '김해성' })
  readonly name: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'https://cdn.lighty.today/image.png',
  })
  readonly profileImageUrl: string | null;
}

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
export type Order = 'DESC' | 'ASC';
