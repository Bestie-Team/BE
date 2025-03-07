import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AddGroupMemberRequest {
  @ApiProperty({
    type: [String],
    example: ['uuid', 'uuid', 'uuid'],
    description: '그룹에 추가할 친구 번호 배열',
  })
  @IsUUID(4, { each: true, message: '회원 번호 형식이 맞지 않습니다.' })
  @IsArray({ message: 'userId는 배열이어야 합니다.' })
  @ArrayMaxSize(9, { message: 'userIds는 최대 10개까지 가능합니다.' })
  @ArrayMinSize(1, { message: 'userIds는 최소 1개 이상이어야 합니다.' })
  readonly userIds: string[];
}
