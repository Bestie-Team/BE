import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Length } from 'class-validator';

export class UpdateGatheringRequest {
  @ApiProperty({
    example: '두리집 청소 모임',
    description: '2 ~ 20자',
  })
  @Length(1, 20, { message: '모임 이름은 최소 1자 최대 20자만 가능합니다.' })
  readonly name: string;

  @ApiProperty({
    example: '두리집 청소부들의 모임입니다.',
    description: '10 ~ 40자',
  })
  @Length(1, 40, { message: '모임 설명은 최소 1자 최대 40자만 가능합니다.' })
  readonly description: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.00Z' })
  @IsDateString({}, { message: 'ISO8601 형식이 아닙니다.' })
  readonly gatheringDate: string;

  @ApiProperty({
    example: '두리 집이 있는 집',
    description: '1 ~ 25자',
  })
  @Length(1, 100, { message: '모임 장소는 최소 1자 최대 100자만 가능합니다.' })
  readonly address: string;
}
