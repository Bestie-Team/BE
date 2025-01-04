/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SearchUserResponse } from 'src/presentation/dto/user/search-user.response';
import { CreateFriendRequest } from 'src/presentation/dto/friend/create-friend.request';
import { login } from 'test/helpers/login';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';
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
  });

  describe('(POST) /friend/{friendId}/accept - 친구 요청 수락', () => {
    it('친구 요청 수락 정상 동작', async () => {
      const { accessToken: receiverToken, accountId: receiverAccountId } =
        await login(app);

      const sender = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'),
      });
      const receiver = await prisma.user.findUnique({
        where: {
          accountId: receiverAccountId,
        },
      });
      const friendRequest = await prisma.friend.create({
        data: generateFriendEntity(sender.id, receiver!.id),
      });

      // when
      const response = await request(app.getHttpServer())
        .post(`/friends/${friendRequest.id}/accept`)
        .set('Authorization', receiverToken);
      const { status } = response;

      expect(status).toEqual(201);
    });
  });
});
