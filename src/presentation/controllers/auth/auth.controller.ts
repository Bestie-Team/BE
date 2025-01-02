import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoginRequest } from '../../dto/auth/login.request';
import { AuthService } from '../../../domain/services/auth/auth.service';
import { Provider } from '../../../shared/types/index';
import { ValidateProviderPipe } from '../../../common/pipes/validate-provider.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(':provider/login')
  async login(
    @Param('provider', ValidateProviderPipe) provider: Provider,
    @Body() dto: LoginRequest,
  ) {
    const { accessToken } = dto;
    await this.authService.login(provider, accessToken);
  }
}
