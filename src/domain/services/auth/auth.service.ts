import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OauthContext } from '../../../infrastructure/auth/context/oauth-context';
import { UsersRepository } from '../../interface/users.repository';
import { Provider } from '../../../shared/types';

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

  async generateToken(payload: string) {
    return await this.jwtService.signAsync(payload);
  }
}
