import { ApiProperty } from '@nestjs/swagger';

export class FileListRequest {
  @ApiProperty({
    description: '업로드할 이미지 배열 (최대 5장)',
    type: [String],
    format: 'binary',
  })
  readonly files: File[];
}
