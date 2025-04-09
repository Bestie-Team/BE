import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, Length, ValidateIf } from 'class-validator';

export class CreateFeedCommentRequest {
  @ApiProperty({ example: 'uuid' })
  @IsUUID(4, { message: 'feedId 형식이 UUID가 아닙니다.' })
  readonly feedId: string;

  @ApiProperty({ example: '나야 댓글' })
  @Length(1, 255, { message: 'content는 1 ~ 255자만 가능합니다.' })
  readonly content: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID(4)
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  readonly mentionedUserId: string | null;
}
