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
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { FriendListResponse } from 'src/presentation/dto/friend/response/friend-list.response';
import { UserCursor } from 'src/presentation/dto/shared';
import { FriendRequestListResponse } from 'src/presentation/dto/friend/response/friend-request-list.response';
import { generate } from 'rxjs';
import { AccepFriendRequest } from 'src/presentation/dto/friend/request/accept-friend.request';
import { FriendRequestCountResponse } from 'src/presentation/dto/friend/response/friend-request-count.response';

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

  afterAll(() => {
    app.close();
  });

  afterEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.gatheringParticipation.deleteMany();
    await prisma.gathering.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.refreshToken.deleteMany();
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
      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId: receiverAccountId,
        },
      });
      const friendRequest = await prisma.friend.create({
        data: generateFriendEntity(sender.id, loginedUser!.id),
      });

      const dto: AccepFriendRequest = {
        senderId: sender.id,
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/friends/accept`)
        .send(dto)
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
      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId: receiverAccountId,
        },
      });
      const friendRequest = await prisma.friend.create({
        data: generateFriendEntity(sender.id, loginedUser!.id),
      });

      const dto: AccepFriendRequest = {
        senderId: sender.id,
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/friends/reject`)
        .send(dto)
        .set('Authorization', receiverToken);
      const { status } = response;

      expect(status).toEqual(201);
    });
  });

  describe('(GET) /friends?cursor={}&limit={} - 친구 목록 조회', () => {
    it('친구 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
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

      const loginedUser = await prisma.user.findFirst({
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

      const loginedUser = await prisma.user.findFirst({
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

      const loginedUser = await prisma.user.findFirst({
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

  describe('(DELETE) /friends/{id} - 친구 삭제', () => {
    it('친구 삭제 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const willDeletedFriend = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'),
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '이민수'),
      });
      const willDeleteRelation = await prisma.friend.create({
        data: generateFriendEntity(
          willDeletedFriend.id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(user1.id, loginedUser!.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(willDeletedFriend.id, user1.id, 'ACCEPTED'),
      });

      // 자신이 만든 모임과 타인이 만든 모임 초대 생성.
      const ownGathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id),
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(willDeletedFriend.id),
      });
      const sentInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          ownGathering.id,
          willDeletedFriend.id,
        ),
      });
      const receivedInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          loginedUser!.id,
        ),
      });
      // 삭제와 무관한 초대, 사라지면 안 됨.
      const otherInvitation1 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(gathering.id, user1.id),
      });
      const otherInvitation2 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(ownGathering.id, user1.id),
      });
      const expectedInvitations = [otherInvitation1, otherInvitation2].sort(
        (a, b) => (a.id > b.id ? 1 : -1),
      );

      const response = await request(app.getHttpServer())
        .delete(`/friends?userId=${willDeletedFriend.id}`)
        .set('Authorization', accessToken);
      const { status } = response;
      const otherInvitationsAfterDelete =
        await prisma.gatheringParticipation.findMany({
          orderBy: { id: 'asc' },
        });

      expect(status).toEqual(204);
      expect(otherInvitationsAfterDelete.length).toEqual(2);
      otherInvitationsAfterDelete.forEach((invitation, i) => {
        expect(invitation.id).toEqual(expectedInvitations[i].id);
      });
    });
  });

  describe('(GET) /friends/requests/count - 전체 친구 요청 수 조회', () => {
    const users = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `account${i}_id`),
    );

    beforeEach(async () => {
      await prisma.user.createMany({ data: users });
    });

    it('친구 요청 수 조회 정상 동작 ', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({ where: { accountId } });

      const sentRequests = Array.from({ length: 2 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i].id, 'PENDING'),
      );
      const receivedRequests = Array.from({ length: 3 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i + 2].id, 'PENDING'),
      );
      await prisma.friend.createMany({
        data: [...sentRequests, ...receivedRequests],
      });

      const response = await request(app.getHttpServer())
        .get('/friends/requests/count')
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FriendRequestCountResponse> =
        response;

      expect(status).toEqual(200);
      expect(body.count).toEqual(5);
    });
  });
});
