import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '../../shared';

export class RegisterRequest {
  @ApiProperty()
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  readonly email: string;

  @ApiProperty()
  // 최대 길이 미정
  @Length(1, 20)
  readonly name: string;

  @ApiProperty()
  @Length(5, 15, { message: '계정 아이디는 최소 5자 최대 15자만 가능합니다.' })
  readonly accountId: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  @IsUrl({}, { message: 'URL 형식이 아닙니다.' })
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null)
  readonly profileImageUrl: string | null;

  @ApiProperty({
    description: '소셜 로그인 플랫폼',
    type: 'string',
    enum: ['GOOGLE', 'APPLE', 'KAKAO'],
    example: 'GOOGLE',
  })
  @IsIn(['GOOGLE', 'KAKAO', 'APPLE'], {
    message: 'provider는 GOOGLE, KAKAO, APPLE만 가능합니다.',
  })
  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  readonly provider: Provider;
}
