import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsUrl,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';
import { GatheringType } from '../../shared';

export class CreateGatheringRequest {
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

  @ApiProperty({
    description: '모임 대상 타입 (친구 OR 그룹)',
    type: 'string',
    enum: ['GROUP', 'FRIEND'],
    example: 'GROUP',
  })
  @IsIn(['GROUP', 'FRIEND'], {
    message: 'type은 GROUP, FRIEND만 가능합니다.',
  })
  readonly type: GatheringType;

  @ApiProperty({
    type: [String],
    nullable: true,
    example: 'uuid',
    description: '모임 type이 FRIEND일 경우 길이가 1이상이어야 합니다.',
  })
  @IsArray()
  @IsUUID(4, { each: true, message: '친구 번호 형식이 맞지 않습니다.' })
  @ArrayNotEmpty({ message: '그룹의 친구는 1명 이상이어야 합니다.' })
  @ArrayMaxSize(10)
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  readonly friendIds: string[] | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'uuid',
    description: '모임 type이 GROUP일 경우 값이 있어야합니다.',
  })
  @IsUUID(4, { each: true, message: '그룹 번호 형식이 맞지 않습니다.' })
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  readonly groupId: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.00Z' })
  @IsDateString({}, { message: 'ISO8601 형식이 아닙니다.' })
  readonly gatheringDate: string;

  @ApiProperty({
    example: '두리 집이 있는 집',
    description: '1 ~ 25자',
  })
  @Length(1, 100, { message: '모임 장소는 최소 1자 최대 100자만 가능합니다.' })
  readonly address: string;

  @ApiProperty({ example: 'https://image.com', description: 'url' })
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly invitationImageUrl: string;
}
