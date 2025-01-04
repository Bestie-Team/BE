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
import { FriendListResponse } from 'src/presentation/dto/friend/friend-list.response';

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

  describe('(POST) /friends/{friendId}/reject - 친구 요청 거절', () => {
    it('친구 요청 거절 정상 동작', async () => {
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
        .post(`/friends/${friendRequest.id}/reject`)
        .set('Authorization', receiverToken);
      const { status } = response;

      expect(status).toEqual(201);
    });
  });

  describe('(GET) /friends?cursor={}&limit={} - 친구 목록 조회', () => {
    it('친구 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', 'kkiri'),
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '김진수'),
      });
      const nonFriend = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '박김수'),
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id),
      });
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id),
      });
      const expectedUsers = [user3, user1, user2];
      const cursor = '가가';
      const limit = 3;

      // when
      const response = await request(app.getHttpServer())
        .get(encodeURI(`/friends?cursor=${cursor}&limit=${limit}`))
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FriendListResponse> = response;
      console.log(body);

      expect(status).toEqual(200);
      expect(body.nextCursor).toEqual(expectedUsers.at(-1)?.name);
      body.users.forEach((user, i) => {
        expect(user.id).toEqual(expectedUsers[i].id);
        expect(user.accountId).toEqual(expectedUsers[i].accountId);
        expect(user.name).toEqual(expectedUsers[i].name);
        expect(user.profileImageUrl).toEqual(expectedUsers[i].profileImageUrl);
      });
    });
  });
});
