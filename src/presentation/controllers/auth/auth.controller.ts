import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateProviderPipe } from 'src/common/pipes/validate-provider.pipe';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { LoginRequest } from 'src/presentation/dto/auth/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/login.response';
import { RegisterRequest } from 'src/presentation/dto/auth/register.request';
import { LoginFailResponse } from 'src/presentation/dto/user/login-fail.response';
import { Provider } from 'src/shared/types';

@ApiTags('/auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '소셜 로그인' })
  @ApiBody({ type: LoginRequest })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 404,
    description: '가입되지 않음',
    type: LoginFailResponse,
  })
  @ApiResponse({
    status: 409,
    description: '다른 플랫폼 로그인 이력 존재',
    type: LoginFailResponse,
  })
  @Post(':provider/login')
  async login(
    @Param('provider', ValidateProviderPipe) provider: Provider,
    @Body() dto: LoginRequest,
  ): Promise<LoginResponse> {
    const { accessToken } = dto;
    return await this.authService.login(provider, accessToken);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterRequest })
  @ApiResponse({
    status: 201,
    description: '회원가입 완료, 즉시 로그인',
    type: LoginResponse,
  })
  @Post('register')
  async register(@Body() dto: RegisterRequest): Promise<LoginResponse> {
    return await this.authService.register(dto);
  }
}
