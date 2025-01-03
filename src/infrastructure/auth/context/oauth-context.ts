import { Injectable } from '@nestjs/common';
import { Provider } from 'src/shared/types';
import { GoogleStrategy } from '../strategies/google-strategy';
@Injectable()
export class OauthContext {
  constructor(private readonly googleStrategy: GoogleStrategy) {}

  async getUserInfo(provider: Provider, token: string) {
    // provider 별 구현체 추가되면 의존성 및 조건문 추가
    return await this.googleStrategy.getUserInfo(token);
  }
}
