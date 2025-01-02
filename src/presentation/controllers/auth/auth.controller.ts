import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoginRequest } from '../../dto/auth/login.request';
import { AuthService } from '../../../domain/services/auth/auth.service';
import { Provider } from '../../../shared/types/index';
import { ValidateProviderPipe } from '../../../common/pipes/validate-provider.pipe';
import { LoginResponse } from '../../dto/auth/login.response';
import { RegisterRequest } from '../../dto/auth/register.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(':provider/login')
  async login(
    @Param('provider', ValidateProviderPipe) provider: Provider,
    @Body() dto: LoginRequest,
  ): Promise<LoginResponse> {
    const { accessToken } = dto;
    return await this.authService.login(provider, accessToken);
  }

  @Post('register')
  async register(@Body() dto: RegisterRequest): Promise<LoginResponse> {
    return await this.authService.register(dto);
  }
}
