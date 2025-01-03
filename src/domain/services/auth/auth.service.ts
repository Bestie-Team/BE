import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { OauthContext } from '../../../infrastructure/auth/context/oauth-context';
import { UsersRepository } from '../../interface/users.repository';
import { Provider } from '../../../shared/types';
import { UserEntity } from '../../entities/user/user.entity';
import { UserPrototype } from '../../types/user.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly oauthContext: OauthContext,
    private readonly jwtService: JwtService,
  ) {}

  async login(provider: Provider, token: string) {
    const userInfo = await this.oauthContext.getUserInfo(provider, token);
    const user = await this.usersRepository.findOneByEmail(userInfo.email);

    if (!user) {
      throw new NotFoundException(userInfo);
    }
    if (!(user.provider === provider)) {
      throw new ConflictException(userInfo);
    }

    return {
      accessToken: await this.generateToken(user.id),
    };
  }

  async register(prototype: UserPrototype) {
    const userByAccountId = await this.usersRepository.findOneByAccountId(
      prototype.accountId,
    );
    if (userByAccountId) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const stdDate = new Date();
    const user = UserEntity.create(prototype, v4, stdDate);
    await this.usersRepository.save(user);

    return {
      accessToken: await this.generateToken(user.id),
    };
  }

  async generateToken(payload: string) {
    return await this.jwtService.signAsync(payload);
  }
}
