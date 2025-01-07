import { ApiProperty } from '@nestjs/swagger';

export class FileRequest {
  @ApiProperty({
    description: '업로드할 이미지',
    type: 'string',
    format: 'binary',
  })
  readonly file: File;
}
