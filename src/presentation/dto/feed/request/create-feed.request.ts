import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsUrl,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';

export class CreateFeedRequest {
  @ApiProperty({
    description: '모임 번호를 null로 하면 개인 피드로 인식합니다.',
    type: 'string',
    nullable: true,
  })
  @IsUUID(4, { each: true, message: '그룹 번호는 UUID여야 합니다.' })
  @IsNotEmpty({ message: '그룹 번호가 없다면 null을 넣어주세요.' })
  @ValidateIf((_, value) => value !== null)
  readonly gatheringId: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUrl({}, { each: true, message: '친구 번호는 UUID여야 합니다.' })
  @ArrayNotEmpty({ message: '피드 이미지는 1장 이상이어야 합니다.' })
  @ArrayMaxSize(5, {
    message: '피드 이미지는 최대 5장까지 가능합니다 가능합니다.',
  })
  readonly imageUrls: string[];

  @ApiProperty()
  @Length(20, 150, { message: '피드 내용은 20 ~ 150자만 가능합니다.' })
  readonly content: string;
}
