import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponse {
  @ApiProperty()
  readonly imageUrl: string;
}
