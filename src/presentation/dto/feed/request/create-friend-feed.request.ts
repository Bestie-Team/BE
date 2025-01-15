import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsUrl,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateFriendFeedRequest {
  @ApiProperty({
    type: [String],
    example: [
      'https://cdn.lighty.today/image1.jpeg',
      'https://cdn.lighty.today/image2.jpeg',
      'https://cdn.lighty.today/image3.jpeg',
    ],
  })
  @IsArray({ message: 'imageUrls는 배열이어야 합니다' })
  @IsUrl(
    {},
    { each: true, message: 'imageUrls중 url 형식이 아닌 값이 있습니다.' },
  )
  @ArrayNotEmpty({ message: '피드 이미지는 1장 이상이어야 합니다.' })
  @ArrayMaxSize(5, {
    message: 'imageUrls는 최대 5개까지 등록 가능합니다.',
  })
  readonly imageUrls: string[];

  @ApiProperty()
  @Length(20, 150, { message: 'content는 20 ~ 150자만 가능합니다.' })
  readonly content: string;

  @ApiProperty({
    type: [String],
    example: ['uuid', 'uuid', 'uuid'],
    description: '비공개 피드의 경우 빈 배열로 주시면됩니다.',
  })
  @IsArray({ message: 'friendIds는 배열이어야 합니다' })
  @IsUUID(4, { each: true, message: 'friendIds중 UUID가 아닌 값이 있습니다.' })
  @ArrayMaxSize(10)
  @IsNotEmpty()
  readonly friendIds: string[];
}
