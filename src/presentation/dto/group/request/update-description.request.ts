import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdateDescriptionRequest {
  @ApiProperty({ example: '멋지게 변경된 설명' })
  @Length(1, 40, { message: '그룹 설명은 최소 1자 최대 40자만 가능합니다.' })
  readonly description: string;
}
