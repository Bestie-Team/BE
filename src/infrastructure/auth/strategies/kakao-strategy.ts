import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { KAKAO_USER_INFO_URL } from 'src/common/constant';
import {
  OauthStrategy,
  OauthUserInfo,
} from 'src/infrastructure/auth/strategies/oauth-strategy';

@Injectable()
export class KakaoStrategy implements OauthStrategy {
  async getUserInfo(token: string): Promise<OauthUserInfo> {
    const response = await fetch(KAKAO_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Kakao API 에러: ${response.status} ${response.statusText}`,
      );
    }
    const body: KakaoUserUserInfo = await response.json();
    const { email } = body.kakao_account;
    const { nickname } = body.kakao_account.profile;

    return {
      email,
      name: nickname,
      provider: 'KAKAO',
    };
  }
}

interface KakaoUserUserInfo {
  id: number;
  connected_at: 'string';
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    email: string;
    email_needs_agreement: boolean;
    has_email: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    profile_nickname_needs_agreement: boolean;
    profile: {
      nickname: string;
      is_default_nickname: boolean;
    };
  };
}
