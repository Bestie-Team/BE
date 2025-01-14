/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import { CreateFeedRequest } from 'src/presentation/dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.feedImage.deleteMany();
    await prisma.feed.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /feeds - 피드 작성', () => {
    it('개인 피드 작성 정상 동작', async () => {
      const { accessToken } = await login(app);

      const dto: CreateFeedRequest = {
        content:
          '안녕하세요 오늘은 두리집을 청소해볼게요, 너무 더러워서 청소가 힘드네요~',
        imageUrls: [
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
        ],
        gatheringId: null,
      };

      const response = await request(app.getHttpServer())
        .post('/feeds')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(201);
    });
  });
});
