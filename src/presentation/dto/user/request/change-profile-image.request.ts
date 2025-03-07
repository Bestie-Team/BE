import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ChangeProfileImageRequest {
  @ApiProperty()
  @IsUrl({}, { message: 'url 형식이 아닙니다.' })
  readonly profileImageUrl: string;
}
