import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserPrototype } from 'src/domain/types/user.types';
import { OauthContext } from 'src/infrastructure/auth/context/oauth-context';
import { Provider } from 'src/shared/types';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import { DecodedTokenData } from 'src/domain/types/auth.types';
import { INVALID_TOKEN_MESSAGE } from 'src/domain/error/messages';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly usersReader: UsersReader,
    private readonly usersWriter: UsersWriter,
    private readonly oauthContext: OauthContext,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTokenExpiration = this.config.get<string>(
      'ACCESS_TOKEN_EXPIRE',
    ) as string;
    this.refreshTokenExpiration = this.config.get<string>(
      'REFRESH_TOKEN_EXPIRE',
    ) as string;
  }

  async login(provider: Provider, token: string) {
    const userInfo = await this.oauthContext.getUserInfo(provider, token);

    try {
      const user = await this.usersReader.readOneByEmail(userInfo.email);

      if (!(user.provider === provider)) {
        throw new ConflictException(userInfo);
      }

      return {
        id: user.id,
        accessToken: await this.generateToken(
          user.id,
          this.accessTokenExpiration,
        ),
        refreshToken: await this.generateToken(
          user.id,
          this.refreshTokenExpiration,
        ),
        accountId: user.accountId,
        profileImageUrl: user.profileImageUrl,
      };
    } catch (e: unknown) {
      if (e instanceof NotFoundException) {
        throw new NotFoundException(userInfo);
      }
      if (e instanceof ConflictException) {
        throw new ConflictException(userInfo);
      }
      throw e;
    }
  }

  async register(prototype: UserPrototype) {
    const userByAccountId = await this.usersReader.readOneByAccountId(
      prototype.accountId,
    );
    if (userByAccountId) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const stdDate = new Date();
    const user = UserEntity.create(prototype, v4, stdDate);
    await this.usersWriter.create(user);

    return {
      id: user.id,
      accessToken: await this.generateToken(
        user.id,
        this.accessTokenExpiration,
      ),
      refreshToken: await this.generateToken(
        user.id,
        this.refreshTokenExpiration,
      ),
      accountId: user.accountId,
    };
  }

  async generateToken(userId: string, expiresIn: string) {
    const payload = { userId, expiresIn };
    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  async refreshAccessToken(refreshToken: string | null) {
    if (!refreshToken) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    try {
      const decoded = await this.jwtService.verifyAsync<DecodedTokenData>(
        refreshToken,
      );
      const { userId } = decoded;

      return {
        accessToken: await this.generateToken(
          userId,
          this.accessTokenExpiration,
        ),
        refreshToken: await this.generateToken(
          userId,
          this.refreshTokenExpiration,
        ),
      };
    } catch (e: unknown) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }
  }
}
