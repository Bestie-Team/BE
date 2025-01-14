import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsUrl,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateFeedRequest {
  @ApiProperty({
    description: '모임 번호를 null로 하면 개인 피드로 인식합니다.',
    type: 'string',
    nullable: true,
  })
  @IsUUID(4, { each: true, message: '그룹 번호 형식이 맞지 않습니다.' })
  readonly gatheringId: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUrl({}, { each: true, message: '친구 번호 형식이 맞지 않습니다.' })
  @ArrayNotEmpty({ message: '피드 이미지는 1장 이상이어야 합니다.' })
  @ArrayMaxSize(5, {
    message: '피드 이미지는 최대 5장까지 가능합니다 가능합니다.',
  })
  readonly imageUrls: string[];

  @ApiProperty()
  @Length(20, 150)
  readonly content: string;
}
