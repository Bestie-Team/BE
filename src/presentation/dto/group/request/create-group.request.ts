import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUrl, IsUUID, Length } from 'class-validator';

export class CreateGroupRequest {
  @ApiProperty()
  @Length(1, 20, { message: '그룹 이름은 최소 1자 최대 20자만 가능합니다.' })
  readonly name: string;

  @ApiProperty()
  @Length(1, 40, { message: '그룹 설명은 최소 1자 최대 40자만 가능합니다.' })
  readonly description: string;

  @ApiProperty()
  @IsArray()
  @IsUUID(4, { each: true, message: '친구 번호 형식이 맞지 않습니다.' })
  @ArrayNotEmpty({ message: '그룹의 친구는 1명 이상이어야합니다.' })
  readonly friendIds: string[];

  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly groupImageUrl: string;
}
