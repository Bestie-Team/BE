import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, Length } from 'class-validator';

export class UpdateGroupRequest {
  @ApiProperty()
  @Length(1, 20, { message: '그룹 이름은 최소 1자 최대 20자만 가능합니다.' })
  readonly name: string;

  @ApiProperty()
  @Length(1, 40, { message: '그룹 설명은 최소 1자 최대 40자만 가능합니다.' })
  readonly description: string;

  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly groupImageUrl: string;
}
