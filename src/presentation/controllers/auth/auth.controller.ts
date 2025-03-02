import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
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
import { Request, Response } from 'express';
import { RefreshAccessResponse } from 'src/presentation/dto/auth/response/refresh-access.response';

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken } = dto;
    const data = await this.authService.login(provider, accessToken);
    const { refreshToken, ...responseDto } = data;

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'dev' ? 'none' : 'strict',
    });

    return responseDto;
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterRequest })
  @ApiResponse({
    status: 201,
    description: '회원가입 완료, 즉시 로그인',
    type: RegisterResponse,
  })
  @Post('register')
  async register(
    @Body() dto: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponse> {
    const data = await this.authService.register(dto);
    const { refreshToken, ...responseDto } = data;

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'dev' ? 'none' : 'strict',
    });

    return responseDto;
  }

  @ApiOperation({
    summary: 'token 재발급',
    description: 'access, refresh 모두 재발급됩니다. refresh는 쿠키에!',
  })
  @ApiResponse({
    status: 200,
    description: '재발급 완료',
    type: RefreshAccessResponse,
  })
  @Get('token')
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshAccessResponse> {
    const refreshToken = req.cookies['refresh_token'];
    const data = await this.authService.refreshAccessToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = data;

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'dev' ? 'none' : 'strict',
    });

    return { accessToken };
  }
}
