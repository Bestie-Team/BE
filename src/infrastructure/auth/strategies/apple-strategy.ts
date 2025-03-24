import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwksClient from 'jwks-rsa';
import { APPLE_KEYS_URL } from 'src/common/constant';
import {
  OauthStrategy,
  OauthUserInfo,
} from 'src/infrastructure/auth/strategies/oauth-strategy';

@Injectable()
export class AppleStrategy implements OauthStrategy {
  private client: jwksClient.JwksClient;

  constructor(private readonly jwtService: JwtService) {
    this.client = jwksClient({
      jwksUri: APPLE_KEYS_URL,
    });
  }

  async getUserInfo(token: string): Promise<OauthUserInfo> {
    const kid = this.extractKidFromHeader(token);
    const key = await this.getSigningKey(kid);
    const verifedData = await this.verifyToken(token, key);

    return {
      email: verifedData.sub,
      name: '',
      provider: 'APPLE',
    };
  }

  private extractKidFromHeader(identifyToken: string) {
    try {
      const decoded: DecodedIdentifyToken = this.jwtService.decode(
        identifyToken,
        {
          complete: true,
        },
      );

      return decoded.header.kid;
    } catch (e: unknown) {
      throw new Error(`invalid token cause: ${e}`);
    }
  }

  private async getSigningKey(kid: string) {
    return await this.client.getSigningKey(kid);
  }

  private async verifyToken(identifyToken: string, key: jwksClient.SigningKey) {
    try {
      const verfiedToken: Payload = await this.jwtService.verifyAsync(
        identifyToken,
        {
          secret: key.getPublicKey(),
          algorithms: ['RS256'],
        },
      );

      return verfiedToken;
    } catch (e: unknown) {
      throw new Error(`invalid token cause: ${e}`);
    }
  }
}

interface DecodedIdentifyToken {
  header: Header;
  payload: Payload;
}

interface Header {
  kid: string;
  alg: string;
}

interface Payload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  c_hash: string;
  email: string;
  email_verified: boolean;
  is_private_email: boolean;
  auth_time: number;
  nonce_supported: true;
}
