import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from 'src/domain/interface/users.repository';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { OauthContext } from 'src/infrastructure/auth/context/oauth-context';
import { GoogleStrategy } from 'src/infrastructure/auth/strategies/google-strategy';
import { UsersPrismaRepository } from 'src/infrastructure/repositories/users-prisma.repository';
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
