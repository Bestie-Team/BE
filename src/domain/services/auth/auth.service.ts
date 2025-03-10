import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Transactional } from '@nestjs-cls/transactional';
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
  NOT_FOUND_REFRESH_TOKEN,
} from 'src/domain/error/messages';
import { RefreshTokenEntity } from 'src/domain/entities/token/refresh-token.entity';
import { RefreshTokenWriter } from 'src/domain/components/token/refresh-token-writer';
import { RefreshTokenReader } from 'src/domain/components/token/refresh-token-reader';
import { OauthUserInfo } from 'src/infrastructure/auth/strategies/oauth-strategy';
import { Provider } from 'src/shared/types';
import {
  UserNotFoundException,
  UserNotRegisteredException,
} from 'src/domain/error/exceptions/not-found.exception';
import { calcDateDiff } from 'src/utils/date';
import {
  DuplicateAccountIdException,
  DuplicateEmailException,
  RegisterdOtherPlatformException,
} from 'src/domain/error/exceptions/conflice.exception';
import { BadRequestException } from 'src/domain/error/exceptions/bad-request.exception';

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

  async login(input: LoginInput, today = new Date()) {
    const { deviceId, provider, providerAccessToken } = input;
    this.validateDeviceId(deviceId);

    const userInfo = await this.oauthContext.getUserInfo(
      provider,
      providerAccessToken,
    );

    const user = await this.getValidatedUserByEmail(provider, userInfo, today);

    const { accessToken, refreshToken } = await this.generateTokens({
      userId: user.id,
      deviceId,
    });

    if (user.deletedAt) {
      await this.restoreUser(user.id, deviceId, refreshToken);
    } else {
      await this.handleStoreRefreshToken(user.id, deviceId, refreshToken);
    }

    return {
      id: user.id,
      accessToken,
      refreshToken,
      accountId: user.accountId,
      profileImageUrl: user.profileImageUrl,
    };
  }

  @Transactional()
  private async restoreUser(userId: string, deviceId: string, token: string) {
    await this.usersWriter.resetDeletedAt(userId);
    await this.handleStoreRefreshToken(userId, deviceId, token);
  }

  private async handleStoreRefreshToken(
    userId: string,
    deviceId: string,
    newToken: string,
  ) {
    const token = await this.refreshTokenReader.readOne(userId, deviceId);

    if (token) {
      await this.refreshTokenWriter.updateToken(userId, deviceId, newToken);
    } else {
      await this.storeRefreshToken({ userId, deviceId, token: newToken });
    }
  }

  async register(prototype: UserPrototype, deviceId: string | null) {
    this.validateDeviceId(deviceId);

    await this.checkDuplicateEmail(prototype.email);
    await this.checkDuplicateAccountId(prototype.accountId);

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

  async checkDuplicateEmail(email: string, today = new Date()) {
    try {
      const user = await this.usersReader.readDeletedByEmail(email);
      const { deletedAt } = user;
      if (deletedAt) {
        if (calcDateDiff(today, deletedAt, 'd') < 30) {
          throw new DuplicateEmailException();
        }
        return;
      }
    } catch (e: unknown) {
      if (e instanceof UserNotFoundException) {
        return;
      }
      throw e;
    }
  }

  async checkDuplicateAccountId(accountId: string, today = new Date()) {
    try {
      const { deletedAt } = await this.usersReader.readOneByAccountId(
        accountId,
      );
      if (deletedAt) {
        if (calcDateDiff(today, deletedAt, 'd') < 30) {
          throw new DuplicateAccountIdException();
        }
        return;
      }
      throw new DuplicateAccountIdException();
    } catch (e: unknown) {
      if (e instanceof UserNotFoundException) {
        return;
      }
      throw e;
    }
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
    this.validateDeviceId(deviceId);
    if (!refreshToken) {
      throw new NotFoundException(NOT_FOUND_REFRESH_TOKEN);
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

    await this.refreshTokenWriter.updateToken(
      userId,
      deviceId,
      newRefreshToken,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async checkValidRefreshToken(
    userId: string,
    deviceId: string,
    token: string,
  ) {
    const storedToken = await this.refreshTokenReader.readOne(userId, deviceId);
    if (!storedToken || storedToken.token !== token) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }
  }

  private async storeRefreshToken(prototype: RefreshTokenPrototype) {
    const stdDate = new Date();
    const token = RefreshTokenEntity.create(prototype, stdDate);

    await this.refreshTokenWriter.create(token);
  }

  private async createUser(prototype: UserPrototype) {
    const stdDate = new Date();
    const user = UserEntity.create(prototype, v4, stdDate);

    await this.usersWriter.create(user);
    return user;
  }

  private validateDeviceId(
    deviceId: string | null,
  ): asserts deviceId is string {
    if (typeof deviceId !== 'string') {
      throw new BadRequestException(MUST_HAVE_DEVICE_ID_MESSAGE);
    }
  }

  private async getValidatedUserByEmail(
    provider: Provider,
    oauthUserInfo: OauthUserInfo,
    today = new Date(),
  ) {
    try {
      const user = await this.usersReader.readOneByEmail(oauthUserInfo.email);
      const { deletedAt } = user;

      if (deletedAt) {
        if (calcDateDiff(today, deletedAt, 'd') < 30) {
          if (user.provider !== provider) {
            throw new RegisterdOtherPlatformException(oauthUserInfo);
          }
          return user;
        }
        throw new UserNotRegisteredException(oauthUserInfo);
      } else {
        if (user.provider !== provider) {
          throw new RegisterdOtherPlatformException(oauthUserInfo);
        }
      }

      return user;
    } catch (e: unknown) {
      if (e instanceof UserNotFoundException) {
        throw new UserNotRegisteredException(oauthUserInfo);
      }
      throw e;
    }
  }

  async logout(userId: string, deviceId: string | null) {
    this.validateDeviceId(deviceId);
    await this.refreshTokenWriter.delete(userId, deviceId);
  }
}
