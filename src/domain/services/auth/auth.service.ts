import {
  BadRequestException,
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
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';
import {
  DecodedTokenData,
  LoginInput,
  RefreshTokenPrototype,
  TokenPayload,
} from 'src/domain/types/auth.types';
import {
  INVALID_TOKEN_MESSAGE,
  MUST_HAVE_DEVICE_ID_MESSAGE,
} from 'src/domain/error/messages';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshTokenWriter } from 'src/domain/components/token/refresh-token-writer';
import { RefreshTokenReader } from 'src/domain/components/token/refresh-token-reader';
import { OauthUserInfo } from 'src/infrastructure/auth/strategies/oauth-strategy';
import { Provider } from 'src/shared/types';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly usersReader: UsersReader,
    private readonly usersWriter: UsersWriter,
    private readonly refreshTokenReader: RefreshTokenReader,
    private readonly refreshTokenWriter: RefreshTokenWriter,
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

  async login(input: LoginInput) {
    const { deviceId, provider, providerAccessToken } = input;
    this.checkExistDeviceId(deviceId);

    const userInfo = await this.oauthContext.getUserInfo(
      provider,
      providerAccessToken,
    );

    const {
      id: userId,
      accountId,
      profileImageUrl,
    } = await this.getValidatedUserByEmail(provider, userInfo);

    const { accessToken, refreshToken } = await this.generateTokens({
      userId,
      deviceId,
    });

    await this.storeRefreshToken({
      userId,
      deviceId,
      token: refreshToken,
    });

    return {
      id: userId,
      accessToken,
      refreshToken,
      accountId,
      profileImageUrl,
    };
  }

  async register(prototype: UserPrototype, deviceId: string | null) {
    this.checkExistDeviceId(deviceId);

    const userByAccountId = await this.usersReader.readOneByAccountId(
      prototype.accountId,
    );
    if (userByAccountId) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const { id: userId, accountId } = await this.createUser(prototype);
    const { accessToken, refreshToken } = await this.generateTokens({
      userId,
      deviceId,
    });

    await this.storeRefreshToken({
      userId,
      deviceId,
      token: refreshToken,
    });

    return {
      id: userId,
      accessToken,
      refreshToken,
      accountId,
    };
  }

  async generateTokens(payload: TokenPayload) {
    const accessToken = await this.generateToken(
      payload,
      this.accessTokenExpiration,
    );
    const refreshToken = await this.generateToken(
      payload,
      this.refreshTokenExpiration,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateToken(payload: TokenPayload, expiresIn: string) {
    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  async refreshAccessToken(
    refreshToken: string | null,
    deviceId: string | null,
  ) {
    this.checkExistDeviceId(deviceId);
    if (!refreshToken) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    let decodedData: DecodedTokenData;
    try {
      decodedData = await this.jwtService.verifyAsync<DecodedTokenData>(
        refreshToken,
      );
    } catch (e: unknown) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    const { userId } = decodedData;
    await this.checkValidRefreshToken(userId, deviceId, refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens({ userId, deviceId });

    await this.refreshTokenWriter.update(userId, deviceId, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async checkValidRefreshToken(
    userId: string,
    deviceId: string,
    token: string,
  ) {
    const storedToken = await this.refreshTokenReader.readOne(userId, deviceId);
    if (!storedToken || storedToken.token !== token) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }
  }

  async storeRefreshToken(prototype: RefreshTokenPrototype) {
    const stdDate = new Date();
    const token = RefreshTokenEntity.create(prototype, stdDate);

    await this.refreshTokenWriter.create(token);
  }

  async createUser(prototype: UserPrototype) {
    const stdDate = new Date();
    const user = UserEntity.create(prototype, v4, stdDate);

    await this.usersWriter.create(user);
    return user;
  }

  checkExistDeviceId(deviceId: string | null): asserts deviceId is string {
    if (typeof deviceId !== 'string') {
      throw new BadRequestException(MUST_HAVE_DEVICE_ID_MESSAGE);
    }
  }

  async getValidatedUserByEmail(
    provider: Provider,
    oauthUserInfo: OauthUserInfo,
  ) {
    const user = await this.usersReader.readOneByEmail(oauthUserInfo.email);
    if (!user) {
      throw new NotFoundException(oauthUserInfo);
    }

    if (!(user.provider === provider)) {
      throw new ConflictException(oauthUserInfo);
    }

    return user;
  }
}
