import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdateFeedRequest {
  @ApiProperty()
  @Length(20, 150, { message: '피드 내용은 20 ~ 150자만 가능합니다.' })
  readonly content: string;
}
