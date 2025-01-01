import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoginRequest } from '../../dto/auth/login.request';
import { AuthService } from '../../../domain/services/auth/auth.service';
import { Provider } from '../../../shared/types/index';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(':provider')
  async login(
    @Param('provider') provider: Provider,
    @Body() dto: LoginRequest,
  ) {
    const { accessToken } = dto;
    await this.authService.login(provider, accessToken);
  }
}
