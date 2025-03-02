import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { OauthContext } from 'src/infrastructure/auth/context/oauth-context';
import { GoogleStrategy } from 'src/infrastructure/auth/strategies/google-strategy';
import { KakaoStrategy } from 'src/infrastructure/auth/strategies/kakao-strategy';
import { RefreshTokenComponentModule } from 'src/modules/token/refresh-token-component.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { AuthController } from 'src/presentation/controllers/auth/auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET_KEY'),
        };
      },
    }),
    UsersComponentModule,
    RefreshTokenComponentModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OauthContext, GoogleStrategy, KakaoStrategy],
})
export class AuthModule {}
