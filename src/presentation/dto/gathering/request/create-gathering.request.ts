import { ApiProperty } from '@nestjs/swagger';
import {
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
  @ApiProperty()
  @Length(2, 20, { message: '모임 이름은 최소 2자 최대 20자만 가능합니다.' })
  readonly name: string;

  @ApiProperty()
  @Length(10, 40, { message: '모임 설명은 최소 10자 최대 40자만 가능합니다.' })
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

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsUUID(4, { each: true, message: '친구 번호 형식이 맞지 않습니다.' })
  @ArrayNotEmpty({ message: '그룹의 친구는 1명 이상이어야합니다.' })
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  readonly friendIds: string[] | null;

  @ApiProperty({ nullable: true })
  @IsUUID(4, { each: true, message: '그룹 번호 형식이 맞지 않습니다.' })
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  readonly groupId: string | null;

  @ApiProperty()
  @IsDateString()
  readonly gatheringDate: string;

  @ApiProperty()
  @Length(1, 25, { message: '모임 장소는 최소 1자 최대 25자만 가능합니다.' })
  readonly address: string;

  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly invitationImageUrl: string;
}
