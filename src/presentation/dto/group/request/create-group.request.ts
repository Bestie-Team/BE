import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsUrl,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateGroupRequest {
  @ApiProperty()
  @Length(1, 20, { message: '그룹 이름은 최소 1자 최대 20자만 가능합니다.' })
  readonly name: string;

  @ApiProperty()
  @Length(1, 40, { message: '그룹 설명은 최소 1자 최대 40자만 가능합니다.' })
  readonly description: string;

  @ApiProperty()
  @IsArray()
  @IsUUID(4, { each: true, message: '친구 번호는 UUID여야 합니다.' })
  @ArrayNotEmpty({ message: '그룹의 친구는 1명 이상이어야 합니다.' })
  @ArrayMaxSize(10, { message: '그룹원은 최대 10명까지 가능합니다.' })
  readonly friendIds: string[];

  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly groupImageUrl: string;
}
