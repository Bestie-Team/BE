import { ApiProperty } from '@nestjs/swagger';

export class UpdateDescriptionRequest {
  @ApiProperty({ example: '멋지게 변경된 설명' })
  readonly description: string;
}
