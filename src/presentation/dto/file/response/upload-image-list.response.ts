import { ApiProperty } from '@nestjs/swagger';

export class UploadImageListResponse {
  @ApiProperty({ type: [String], description: '이미지 url 배열' })
  readonly imageUrls: string[];
}
