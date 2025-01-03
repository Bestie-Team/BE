import { Body, Controller, Param, Post } from '@nestjs/common';
import { ValidateProviderPipe } from 'src/common/pipes/validate-provider.pipe';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { LoginRequest } from 'src/presentation/dto/auth/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/login.response';
import { RegisterRequest } from 'src/presentation/dto/auth/register.request';
import { Provider } from 'src/shared/types';

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
