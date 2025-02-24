import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UserPrototype } from 'src/domain/types/user.types';
import { OauthContext } from 'src/infrastructure/auth/context/oauth-context';
import { Provider } from 'src/shared/types';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { UsersWriter } from 'src/domain/components/user/users-writer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersReader: UsersReader,
    private readonly usersWriter: UsersWriter,
    private readonly oauthContext: OauthContext,
    private readonly jwtService: JwtService,
  ) {}

  async login(provider: Provider, token: string) {
    const userInfo = await this.oauthContext.getUserInfo(provider, token);

    try {
      const user = await this.usersReader.readOneByEmail(userInfo.email);

      if (!(user.provider === provider)) {
        throw new ConflictException(userInfo);
      }

      return {
        id: user.id,
        accessToken: await this.generateToken(user.id),
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
      accessToken: await this.generateToken(user.id),
      accountId: user.accountId,
    };
  }

  async generateToken(payload: string) {
    return await this.jwtService.signAsync(payload);
  }
}
