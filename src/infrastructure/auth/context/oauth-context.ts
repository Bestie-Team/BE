import { Injectable } from '@nestjs/common';
import { Provider } from 'src/shared/types';
import { GoogleStrategy } from '../strategies/google-strategy';
import { KakaoStrategy } from 'src/infrastructure/auth/strategies/kakao-strategy';
import { OauthUserInfo } from 'src/infrastructure/auth/strategies/oauth-strategy';
@Injectable()
export class OauthContext {
  constructor(
    private readonly googleStrategy: GoogleStrategy,
    private readonly kakaoStrategy: KakaoStrategy,
  ) {}

  async getUserInfo(provider: Provider, token: string): Promise<OauthUserInfo> {
    // provider 별 구현체 추가되면 의존성 및 조건문 추가
    return provider === 'GOOGLE'
      ? await this.googleStrategy.getUserInfo(token)
      : provider === 'KAKAO'
      ? await this.kakaoStrategy.getUserInfo(token)
      : {
          email: 'apple-not-imple',
          name: 'name',
          provider: 'APPLE',
        };
  }
}
