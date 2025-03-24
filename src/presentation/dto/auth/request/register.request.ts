import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '../../shared';

export class RegisterRequest {
  @ApiProperty({ example: 'lighty@gmail.com' })
  @IsString()
  readonly email: string;

  @ApiProperty({ example: '재은최' })
  // 최대 길이 미정
  @Length(1, 20)
  readonly name: string;

  @ApiProperty({ example: 'good_orange' })
  @Length(5, 15, { message: '계정 아이디는 최소 5자 최대 15자만 가능합니다.' })
  readonly accountId: string;

  @ApiProperty({
    example: 'https://cdn.lighty.today/image.com',
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

  @ApiProperty()
  @IsBoolean()
  @IsIn([true], { message: '서비스 이용 약관에 동의는 필수입니다.' })
  readonly termsOfServiceConsent: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsIn([true], { message: '개인정보 수집 및 이용 동의는 필수입니다.' })
  readonly privacyPolicyConsent: boolean;
}
