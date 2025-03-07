import { Provider } from 'src/shared/types';

export interface LoginInput {
  readonly provider: Provider;
  readonly providerAccessToken: string;
  readonly deviceId: string | null;
}

// token payload에 값이 추가돼도 저장하는 토큰 관련 데이터는 변하지 않을 가능성 높음 -> 다른 타입에서 확장해서 사용 안 함.
export interface TokenPayload {
  readonly userId: string;
  readonly deviceId: string;
}

export interface RefreshTokenPrototype {
  readonly userId: string;
  readonly deviceId: string;
  readonly token: string;
}

export interface DecodedTokenData {
  readonly userId: string;
  readonly deviceId: string;
  readonly exp: number;
  readonly expiresIn: string;
  readonly iat: number;
}

export interface RefreshToken {
  readonly userId: string;
  readonly deviceId: string;
  readonly token: string;
  readonly createdAt: Date;
}
