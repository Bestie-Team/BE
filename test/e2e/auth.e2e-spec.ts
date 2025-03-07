import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RegisterRequest, RegisterResponse } from 'src/presentation/dto';
import { ResponseResult } from 'test/helpers/types';
import { RefreshAccessResponse } from 'src/presentation/dto/auth/response/refresh-access.response';
import { login } from 'test/helpers/login';
import { ListenersModule } from 'src/infrastructure/event/listeners/listeners.module';
import { EmptyModule } from 'test/helpers/empty.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ListenersModule)
      .useModule(EmptyModule)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    await app.init();
  });

  afterAll(() => {
    app.close();
  });

  afterEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /auth/register - 회원가입', () => {
    const dto: RegisterRequest = {
      accountId: 'accound_id',
      email: 'test@test.com',
      name: '라이티',
      provider: 'GOOGLE',
      profileImageUrl: 'https://image.com',
      privacyPolicyConsent: true,
      termsOfServiceConsent: true,
    };
    const deviceId = 'deviceId123';

    it('회원가입 정상 동작', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Device-ID', deviceId)
        .send(dto);
      const { status, body }: ResponseResult<RegisterResponse> = response;

      expect(status).toEqual(201);
      expect(body.id).toBeTruthy();
      expect(body.accountId).toEqual(dto.accountId);
      expect(body.accessToken).toBeTruthy();
    });

    it('헤더에 디바이스 식별 번호가 없는 경우 예외가 발생한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto);
      const { status, body }: ResponseResult<RegisterResponse> = response;

      expect(status).toEqual(400);
    });
  });

  describe('(GET) /auth/token - 토큰 재발급', () => {
    const dto: RegisterRequest = {
      accountId: 'accound_id',
      email: 'test@test.com',
      name: '라이티',
      provider: 'GOOGLE',
      profileImageUrl: 'https://image.com',
      privacyPolicyConsent: true,
      termsOfServiceConsent: true,
    };
    const deviceId = 'deviceId123';

    it('토큰 재발급 정상 동작', async () => {
      const agent = request.agent(app.getHttpServer());

      const registerResponse = await agent
        .post('/auth/register')
        .set('Device-ID', deviceId)
        .send(dto);

      const response = await agent
        .get('/auth/token')
        .set('Device-ID', deviceId);

      const { status, body }: ResponseResult<RefreshAccessResponse> = response;

      expect(status).toEqual(200);
      expect(body.accessToken).toBeTruthy();
    });

    it('헤더에 디바이스 식별 번호가 없는 경우 예외가 발생한다', async () => {
      const response = await request(app.getHttpServer()).get('/auth/token');
      const { status }: ResponseResult<RefreshAccessResponse> = response;

      expect(status).toEqual(400);
    });

    it('유효하지 않은 리프레시 토큰일 경우 예외가 발생한다', async () => {
      const invalidRefreshToken = 'invalidToken';

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Device-ID', deviceId)
        .send(dto);

      const response = await request(app.getHttpServer())
        .get('/auth/token')
        .set('Device-ID', deviceId)
        .set('Cookie', `refresh_token=${invalidRefreshToken}`);
      const { status }: ResponseResult<RefreshAccessResponse> = response;

      expect(status).toEqual(401);
    });

    it('토큰은 유효하지만 디바이스 식별값이 다른 경우 예외가 발생한다', async () => {
      const otherDeviceID = 'otherDeivceId';
      const agent = request.agent(app.getHttpServer());

      const registerResponse = await agent
        .post('/auth/register')
        .set('Device-ID', deviceId)
        .send(dto);

      const response = await agent
        .get('/auth/token')
        .set('Device-ID', otherDeviceID);

      const { status }: ResponseResult<RefreshAccessResponse> = response;

      expect(status).toEqual(401);
    });

    it('토큰이 존재하지 않는 경우 예외가 발생한다', async () => {
      const agent = request.agent(app.getHttpServer());

      const response = await agent
        .get('/auth/token')
        .set('Device-ID', deviceId);

      const { status }: ResponseResult<RefreshAccessResponse> = response;

      expect(status).toEqual(404);
    });
  });

  describe('(DELETE) /auth/logout - 로그아웃', () => {
    it('로그아웃 정상 동작 ', async () => {
      const { accessToken, deviceId } = await login(app);

      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', accessToken)
        .set('Device-ID', deviceId);
      const { status } = response;

      const token = await prisma.refreshToken.findMany();

      expect(status).toEqual(204);
      expect(token.length).toEqual(0);
    });
  });
});
