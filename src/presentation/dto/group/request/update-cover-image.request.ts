import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateCoverImageRequest {
  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly groupImageUrl: string;
}
