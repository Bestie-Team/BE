import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { validationSchema } from 'src/configs/config-module/validation';
import { RegisterdOtherPlatformException } from 'src/domain/error/exceptions/conflice.exception';
import { UserNotRegisteredException } from 'src/domain/error/exceptions/not-found.exception';
import { AuthService } from 'src/domain/services/auth/auth.service';
import { OauthContext } from 'src/infrastructure/auth/context/oauth-context';
import { OauthUserInfo } from 'src/infrastructure/auth/strategies/oauth-strategy';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { generateUserEntity } from 'test/helpers/generators';

describe('AuthService', () => {
  let authService: AuthService;
  let oauthContext: OauthContext;
  let db: PrismaService;
  const mockUserInfo: OauthUserInfo = {
    email: 'test@example.com',
    name: '강회원',
    provider: 'GOOGLE',
  };

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
        }),
        JwtModule.registerAsync({
          global: true,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            return {
              secret: config.get<string>('JWT_SECRET_KEY'),
            };
          },
        }),
        AuthModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
      providers: [
        { provide: OauthContext, useValue: { getUserInfo: jest.fn() } },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    oauthContext = app.get<OauthContext>(OauthContext);
    db = app.get<PrismaService>(PrismaService);

    jest.spyOn(oauthContext, 'getUserInfo').mockResolvedValue(mockUserInfo);
  });

  afterEach(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  describe('로그인', () => {
    const deviceId = 'deviceId';

    it('가입되지 않은 회원인 경우 예외와 회원 정보를 반환한다.', async () => {
      await expect(async () =>
        authService.login({
          deviceId,
          provider: 'GOOGLE',
          providerAccessToken: 'token',
        }),
      ).rejects.toThrow(new UserNotRegisteredException(mockUserInfo));
    });

    it('다른 플랫폼으로 이미 가입된 경우 예외와 회원 정보를 반환한다.', async () => {
      const user = generateUserEntity(
        mockUserInfo.email,
        'account_id',
        mockUserInfo.name,
        'https://image.com',
        'KAKAO',
      );
      await db.user.create({ data: user });

      await expect(async () =>
        authService.login({
          deviceId,
          provider: 'GOOGLE',
          providerAccessToken: 'token',
        }),
      ).rejects.toThrow(
        new RegisterdOtherPlatformException({
          email: user.email,
          name: user.name,
          provider: user.provider,
        }),
      );
    });

    it('탈퇴한지 30일 이내에 로그인을 하는 경우 자동으로 복구하고 로그인한다.', async () => {
      const user = generateUserEntity(
        mockUserInfo.email,
        'account_id',
        mockUserInfo.name,
        'https://image.com',
        'GOOGLE',
      );
      await db.user.create({ data: user });
      await db.user.update({
        data: { deletedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) },
        where: { id: user.id },
      });

      const loginInfo = await authService.login({
        deviceId,
        provider: 'GOOGLE',
        providerAccessToken: 'token',
      });

      expect(loginInfo.id).toEqual(user.id);
      expect(loginInfo.accountId).toEqual(user.accountId);
      expect(loginInfo.profileImageUrl).toEqual(user.profileImageUrl);
      expect(loginInfo.accessToken).toBeDefined();
      expect(loginInfo.refreshToken).toBeDefined();
    });

    it('탈퇴한지 30일 이내에 같은 이메일 다른 플랫폼으로 로그인을 시도하면 예외와 탈퇴한 회원 정보를 반환한다.', async () => {
      const user = generateUserEntity(
        mockUserInfo.email,
        'account_id',
        mockUserInfo.name,
        'https://image.com',
        'KAKAO',
      );
      await db.user.create({ data: user });
      await db.user.update({
        data: { deletedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) },
        where: { id: user.id },
      });

      await expect(async () =>
        authService.login({
          deviceId,
          provider: 'GOOGLE',
          providerAccessToken: 'token',
        }),
      ).rejects.toThrow(
        new RegisterdOtherPlatformException({
          email: user.email,
          name: user.name,
          provider: user.provider,
        }),
      );
    });

    it('탈퇴한지 30일이 경과한 경우 미가입 회원으로 처리한다.', async () => {
      const user = generateUserEntity(
        mockUserInfo.email,
        'account_id',
        mockUserInfo.name,
        'https://image.com',
        'GOOGLE',
      );
      await db.user.create({ data: user });
      await db.user.update({
        data: { deletedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        where: { id: user.id },
      });

      await expect(async () =>
        authService.login({
          deviceId,
          provider: user.provider,
          providerAccessToken: 'token',
        }),
      ).rejects.toThrow(
        new UserNotRegisteredException({
          email: user.email,
          name: user.name,
          provider: user.provider,
        }),
      );
    });
  });
});
