/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SearchUserResponse } from 'src/presentation/dto/user/search-user.response';
import { CreateFriendRequest } from 'src/presentation/dto/friend/create-friend.request';
import { login } from 'test/helpers/login';
import { generateUserEntity } from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';

describe('FriendsController (e2e)', () => {
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
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /friends - 친구 요청', () => {
    it('친구 요청 정상 동작', async () => {
      const { accessToken } = await login(app);

      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 3
      });
      const dto: CreateFriendRequest = { userId: user1.id };

      // when
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status }: ResponseResult<SearchUserResponse> = response;

      expect(status).toEqual(201);
    });

    it('중복 요청하는 경우 예외', async () => {
      const { accessToken } = await login(app);

      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 3
      });
      const dto: CreateFriendRequest = { userId: user1.id };

      // when
      await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(409);
    });

    it('존재하지 않는 회원에게 요청하는 경우 예외', async () => {
      const { accessToken } = await login(app);

      const nonExistUserId = 'fcf85b63-d69c-4351-be5c-0ab17a465470';
      const dto: CreateFriendRequest = { userId: nonExistUserId };

      // when
      await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(404);
    });
  });
});
