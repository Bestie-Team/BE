/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { CreateFriendRequest } from 'src/presentation/dto/friend/request/create-friend.request';
import { login } from 'test/helpers/login';
import {
  generateFriendEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { FriendListResponse } from 'src/presentation/dto/friend/response/friend-list.response';
import { UserCursor } from 'src/presentation/dto/shared';
import { FriendRequestListResponse } from 'src/presentation/dto/friend/response/friend-request-list.response';

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

    it('이미 친구인 회원에게 요청하는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 3
      });
      const friendRealtion = await prisma.friend.create({
        data: generateFriendEntity(user1.id, loginedUser!.id, 'ACCEPTED'),
      });
      const dto: CreateFriendRequest = { userId: user1.id };

      // when
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(409);
    });

    it('자신에게 요청을 보낸 회원에게 요청하는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 3
      });
      const friendRealtion = await prisma.friend.create({
        data: generateFriendEntity(user1.id, loginedUser!.id, 'PENDING'),
      });
      const dto: CreateFriendRequest = { userId: user1.id };

      // when
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(409);
    });

    it('신고한 회원에게 요청하는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 3
      });
      const friendRealtion = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'REPORTED'),
      });
      const dto: CreateFriendRequest = { userId: user1.id };

      // when
      const response = await request(app.getHttpServer())
        .post('/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(400);
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
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김진수'), // 1
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '김진수'), // 2
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '김진수'), // 3
      });
      const nonFriend = await prisma.user.create({
        data: generateUserEntity('test5@test.com', 'lighty_5', '박김수'),
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const friendRealtion4 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user4.id, 'ACCEPTED'),
      });
      const expectedUsers = [user3, user4, user1];
      const cursor = {
        name: user2.name,
        accountId: user2.accountId,
      };
      const limit = 3;

      // when
      const url = encodeURI(
        `/friends?cursor=${JSON.stringify(cursor)}&limit=${limit}`,
      );
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FriendListResponse> = response;

      expect(status).toEqual(200);
      expect(body.nextCursor).toEqual({
        name: expectedUsers.at(-1)?.name,
        accountId: expectedUsers.at(-1)?.accountId,
      });
      body.users.forEach((user, i) => {
        expect(user.id).toEqual(expectedUsers[i].id);
        expect(user.accountId).toEqual(expectedUsers[i].accountId);
        expect(user.name).toEqual(expectedUsers[i].name);
        expect(user.profileImageUrl).toEqual(expectedUsers[i].profileImageUrl);
      });
    });
  });

  describe('(GET) /friends/search?search={}&cursor={}&limit={} - 친구 검색', () => {
    it('검색 정상 동작 (이름, 계정 아이디)', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김진수'), // 1
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '김진수'), // 2
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '김진수'), // 3
      });
      const nonFriend = await prisma.user.create({
        data: generateUserEntity('test5@test.com', 'lighty_5', '박김수'),
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const friendRealtion4 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user4.id, 'ACCEPTED'),
      });
      const friendRealtion5 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, nonFriend.id, 'PENDING'),
      });
      const expectedNameUsers = [user3, user4];
      const expectedAccountIdUsers = [user3, user4, user1];
      const searchName = '김진';
      const searchAccountId = 'ght';
      const cursor = {
        name: user2.name,
        accountId: user2.accountId,
      };
      const limit = 3;

      // when
      const nameResponse = await request(app.getHttpServer())
        .get(
          encodeURI(
            `/friends/search?search=${searchName}&cursor=${JSON.stringify(
              cursor,
            )}&limit=${limit}`,
          ),
        )
        .set('Authorization', accessToken);
      const accountIdResponse = await request(app.getHttpServer())
        .get(
          encodeURI(
            `/friends/search?search=${searchAccountId}&cursor=${JSON.stringify(
              cursor,
            )}&limit=${limit}`,
          ),
        )
        .set('Authorization', accessToken);
      const {
        status: nameStatus,
        body: nameBody,
      }: ResponseResult<FriendListResponse> = nameResponse;
      const {
        status: accountIdStaus,
        body: accountIdBody,
      }: ResponseResult<FriendListResponse> = accountIdResponse;

      expect(nameStatus).toEqual(200);
      expect(accountIdStaus).toEqual(200);
      expect(nameBody.nextCursor).toBeNull();
      expect(accountIdBody.nextCursor).toEqual({
        name: expectedAccountIdUsers.at(-1)?.name,
        accountId: expectedAccountIdUsers.at(-1)?.accountId,
      });
      nameBody.users.forEach((user, i) => {
        expect(user.id).toEqual(expectedNameUsers[i].id);
        expect(user.accountId).toEqual(expectedNameUsers[i].accountId);
        expect(user.name).toEqual(expectedNameUsers[i].name);
        expect(user.profileImageUrl).toEqual(
          expectedNameUsers[i].profileImageUrl,
        );
      });
      accountIdBody.users.forEach((user, i) => {
        expect(user.id).toEqual(expectedAccountIdUsers[i].id);
        expect(user.accountId).toEqual(expectedAccountIdUsers[i].accountId);
        expect(user.name).toEqual(expectedAccountIdUsers[i].name);
        expect(user.profileImageUrl).toEqual(
          expectedAccountIdUsers[i].profileImageUrl,
        );
      });
    });
  });

  describe('(GET) /friends/requests/received?cursor={}&limit={} - 받은 친구 요청 목록 조회', () => {
    it('친구 요청 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 1
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'), // 2
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '이수진'), // 3
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '이수진'),
      });
      const sentRequest = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id),
      });
      const receivedRequest1 = await prisma.friend.create({
        data: generateFriendEntity(user1.id, loginedUser!.id),
      });
      const receivedRequest2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id),
      });
      const receivedRequest3 = await prisma.friend.create({
        data: generateFriendEntity(user3.id, loginedUser!.id),
      });
      const expectedFriendRequests = [receivedRequest2, receivedRequest3];
      const expectedUsers = [user2, user3];

      const cursor: UserCursor = {
        name: user1.name,
        accountId: user1.accountId,
      };
      const limit = 2;

      const url = encodeURI(
        `/friends/requests/received?cursor=${JSON.stringify(
          cursor,
        )}&limit=${limit}`,
      );
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FriendRequestListResponse> =
        response;

      expect(status).toEqual(200);
      expect(body.nextCursor).toEqual({
        name: expectedUsers.at(-1)?.name,
        accountId: expectedUsers.at(-1)?.accountId,
      });
      body.requests.forEach((request, i) => {
        expect(request.id).toEqual(expectedFriendRequests[i].id);
        expect(request.sender.id).toEqual(expectedUsers[i].id);
        expect(request.sender.name).toEqual(expectedUsers[i].name);
        expect(request.sender.accountId).toEqual(expectedUsers[i].accountId);
        expect(request.sender.profileImageUrl).toEqual(
          expectedUsers[i].profileImageUrl,
        );
      });
    });
  });

  describe('(GET) /friends/requests/sent?cursor={}&limit={} - 보낸 친구 요청 목록 조회', () => {
    it('친구 요청 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 1
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'), // 2
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '이수진'), // 3
      });
      const user4 = await prisma.user.create({
        data: generateUserEntity('test4@test.com', 'lighty_4', '이수진'),
      });
      // const receivedRequest = await prisma.friend.create({
      //   data: generateFriendEntity(user3.id, loginedUser!.id),
      // });
      const sentRequest1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id),
      });
      const sentRequest2 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user2.id),
      });
      const sentRequest3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id),
      });
      const expectedFriendRequests = [sentRequest2, sentRequest3];
      const expectedUsers = [user2, user3];

      const cursor: UserCursor = {
        name: user1.name,
        accountId: user1.accountId,
      };
      const limit = 2;

      const url = encodeURI(
        `/friends/requests/sent?cursor=${JSON.stringify(
          cursor,
        )}&limit=${limit}`,
      );
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FriendRequestListResponse> =
        response;

      expect(status).toEqual(200);
      expect(body.nextCursor).toEqual({
        name: expectedUsers.at(-1)?.name,
        accountId: expectedUsers.at(-1)?.accountId,
      });
      body.requests.forEach((request, i) => {
        expect(request.id).toEqual(expectedFriendRequests[i].id);
        expect(request.sender.id).toEqual(expectedUsers[i].id);
        expect(request.sender.name).toEqual(expectedUsers[i].name);
        expect(request.sender.accountId).toEqual(expectedUsers[i].accountId);
        expect(request.sender.profileImageUrl).toEqual(
          expectedUsers[i].profileImageUrl,
        );
      });
    });
  });
});
