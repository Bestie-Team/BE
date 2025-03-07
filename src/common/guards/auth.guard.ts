import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DecodedTokenData } from 'src/domain/types/auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { userId?: string }>();
    const accessToken = this.extractAccessTokenFromHeader(req);

    const decoded = await this.verifyAccessToken(accessToken);
    req.userId = decoded.userId;
    return true;
  }

  private async verifyAccessToken(accessToken: string) {
    try {
      return await this.jwtService.verifyAsync<DecodedTokenData>(accessToken);
    } catch (e: unknown) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }

  private extractAccessTokenFromHeader(request: Request) {
    const { authorization } = request.headers;
    if (!authorization || authorization.trim() === '') {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    return authorization.split(' ')[1];
  }
}
