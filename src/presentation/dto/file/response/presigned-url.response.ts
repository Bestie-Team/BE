import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponse {
  @ApiProperty({
    example: 'https://버킷정보~',
    description: '이미지 업로드 할 수 있는 url',
  })
  readonly presignedUrl: string;

  @ApiProperty({
    example: 'user/profile',
    description: '이미지 경로, 리소스 생성 시 ${cdnUrl}/${key}로 사용',
  })
  readonly key: string;
}
