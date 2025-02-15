import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateProviderPipe } from 'src/common/pipes/validate-provider.pipe';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { LoginRequest } from 'src/presentation/dto/auth/request/login.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { LoginFailResponse } from 'src/presentation/dto/user/response/login-fail.response';
import { Provider } from 'src/shared/types';
import { RegisterResponse } from 'src/presentation/dto/auth/response/register.response';

@ApiTags('/auth')
@ApiResponse({ status: 400, description: '입력값 검증 실패' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '소셜 로그인' })
  @ApiBody({ type: LoginRequest })
  @ApiParam({
    name: 'provider',
    description: '소셜 로그인 플랫폼',
    enum: ['GOOGLE', 'KAKAO', 'APPLE'],
    example: 'GOOGLE',
  })
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
    type: RegisterResponse,
  })
  @Post('register')
  async register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    return await this.authService.register(dto);
  }
}
