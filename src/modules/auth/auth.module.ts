import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../../presentation/controllers/auth/auth.controller';
import { AuthService } from '../../domain/services/auth/auth.service';
import { OauthContext } from '../../infrastructure/auth/context/oauth-context';
import { GoogleStrategy } from '../../infrastructure/auth/strategies/google-strategy';
import { UsersRepository } from '../../domain/interface/users.repository';
import { UsersPrismaRepository } from '../../infrastructure/repositories/users-prisma.repository';

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
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OauthContext,
    GoogleStrategy,
    { provide: UsersRepository, useClass: UsersPrismaRepository },
  ],
})
export class AuthModule {}
