import { ApiProperty } from '@nestjs/swagger';
import { Provider } from 'src/shared/types';

export class LoginFailResponse {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty({
    description: '소셜 로그인 플랫폼',
    type: 'string',
    enum: ['GOOGLE', 'APPLE', 'KAKAO'],
    example: 'GOOGLE',
  })
  readonly provider: Provider;
}
