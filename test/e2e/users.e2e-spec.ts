/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SearchUserResponse } from 'src/presentation/dto/user/response/search-user.response';
import { login } from 'test/helpers/login';
import {
  generateFeedEntity,
  generateFriendEntity,
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { ChangeAccountIdRequest } from 'src/presentation/dto';
import { UserDetailResponse } from 'src/presentation/dto/user/response/user-detail.response';

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

  afterAll(() => {
    app.close();
  });

  afterEach(async () => {
    await prisma.friend.deleteMany();
    await prisma.feed.deleteMany();
    await prisma.groupParticipation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(GET) /users/search?search={} - 회원 검색', () => {
    it('회원 검색 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const users = Array.from({ length: 50 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}_id`, `김민수${i}`),
      );
      await prisma.user.createMany({
        data: users,
      });

      const sentFriendRequests = Array.from({ length: 10 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i].id, 'PENDING'),
      );
      const receivedFriendRequests = Array.from({ length: 10 }, (_, i) =>
        generateFriendEntity(
          users[i + sentFriendRequests.length].id,
          loginedUser!.id,
          'PENDING',
        ),
      );
      const friend = Array.from({ length: 10 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i + 40].id, 'ACCEPTED'),
      );
      await prisma.friend.createMany({
        data: [...sentFriendRequests, ...receivedFriendRequests, ...friend],
      });

      const searchKeyword = 'acc';
      const cursor = {
        name: '가',
        accountId: 'a',
      };
      const limit = 40;

      // 이름으로 오름차순 정렬.
      const expectedUsers = users
        .filter((_, i) => i < 40)
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

      // when
      const url = encodeURI(
        `/users/search?search=${searchKeyword}&cursor=${JSON.stringify(
          cursor,
        )}&limit=${limit}`,
      );
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<SearchUserResponse> = response;
      const { users: resUsers, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual({
        name: expectedUsers.at(-1)?.name,
        accountId: expectedUsers.at(-1)?.accountId,
      });
      resUsers.forEach((user, i) => {
        expect(user.id).toEqual(expectedUsers[i].id);
        expect(user.accountId).toEqual(expectedUsers[i].accountId);
        expect(user.name).toEqual(expectedUsers[i].name);
        expect(user.profileImageUrl).toEqual(expectedUsers[i].profileImageUrl);
      });
    });
  });

  describe('(PATCH) /users/accound-id - 계정 아이디 변경', () => {
    it('계정 아이디 변경 정상 동작', async () => {
      const { accessToken } = await login(app);

      const dto: ChangeAccountIdRequest = {
        accountId: 'new_account_id',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/account-id')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;
      const updatedUser = await prisma.user.findFirst({
        where: {
          accountId: 'new_account_id',
        },
      });

      expect(status).toEqual(204);
      expect(updatedUser).not.toBeNull();
    });

    it('이미 존재하는 계정 아이디로 변경하려는 경우 예외', async () => {
      const { accessToken } = await login(app);

      const user = await prisma.user.create({
        data: generateUserEntity('test@test.com', 'account_id'),
      });
      const dto: ChangeAccountIdRequest = {
        accountId: user.accountId,
      };

      const response = await request(app.getHttpServer())
        .patch('/users/account-id')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(409);
    });
  });

  describe('(GET) /users/my - 내 프로필 조회', () => {
    it('내 프로필 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const users = Array.from({ length: 10 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `accound${i}`, `김철수${i}`),
      );
      await prisma.user.createMany({ data: users });

      // 내가 요청 보낸 친구, 받은 친구, 대기 상태인 요청 각각 생성.
      const sendFriendRelation = Array.from({ length: 4 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
      );
      const receivedFriendRelation = Array.from({ length: 4 }, (_, i) =>
        generateFriendEntity(users[4 + i].id, loginedUser!.id, 'ACCEPTED'),
      );
      const pendingFriendRelation = Array.from({ length: 2 }, (_, i) =>
        generateFriendEntity(users[8 + i].id, loginedUser!.id, 'PENDING'),
      );
      const friends = [
        ...sendFriendRelation,
        ...receivedFriendRelation,
        ...pendingFriendRelation,
      ];
      await prisma.friend.createMany({ data: friends });

      // 그룹 생성
      const ownGroups = Array.from({ length: 5 }, (_, i) =>
        generateGroupEntity(loginedUser!.id, `그룹명${i}`),
      );
      const notOwnGroups = Array.from({ length: 5 }, (_, i) =>
        generateGroupEntity(users[0].id, `그룹명${i}`),
      );
      const groups = [...ownGroups, ...notOwnGroups];
      await prisma.group.createMany({ data: groups });

      // 자신의 오너 그룹 참여 생성
      const ownGroupParticipations = ownGroups.map((group) =>
        generateGroupParticipationEntity(group.id, loginedUser!.id, new Date()),
      );
      // 오너가 아닌 그룹 일부에 참여
      const groupJoin = Array.from({ length: 3 }, (_, i) =>
        generateGroupParticipationEntity(
          notOwnGroups[i].id,
          loginedUser!.id,
          new Date(),
        ),
      );
      await prisma.groupParticipation.createMany({
        data: [...groupJoin, ...ownGroupParticipations],
      });

      // 피드 생성
      const feeds = Array.from({ length: 10 }, (_, i) =>
        generateFeedEntity(loginedUser!.id),
      );
      await prisma.feed.createMany({
        data: feeds,
      });
      const acceptedFriend = [...sendFriendRelation, ...receivedFriendRelation];

      const response = await request(app.getHttpServer())
        .get('/users/my')
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<UserDetailResponse> = response;

      expect(status).toEqual(200);
      expect(body.id).toEqual(loginedUser!.id);
      expect(body.accountId).toEqual(loginedUser!.accountId);
      expect(body.name).toEqual(loginedUser!.name);
      expect(body.profileImageUrl).toEqual(loginedUser!.profileImageUrl);
      expect(body.feedCount).toEqual(feeds.length);
      expect(body.friendCount).toEqual(acceptedFriend.length);
      expect(body.groupCount).toEqual([...ownGroups, ...groupJoin].length);
    });

    // TODO 모든 카운트 정보가 0명일 떄 조회.
  });

  it('탈퇴한 회원은 친구 수에 집계되지 않아야 한다', async () => {
    const { accessToken, accountId } = await login(app);

    const loginedUser = await prisma.user.findFirst({
      where: {
        accountId,
      },
    });

    const users = Array.from({ length: 10 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `accound${i}`, `김철수${i}`),
    );
    await prisma.user.createMany({ data: users });

    const friendRelations = Array.from({ length: 10 }, (_, i) =>
      generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
    );
    await prisma.friend.createMany({ data: friendRelations });

    // 친구 중 탈퇴한 사용자 2명
    await prisma.user.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id: users[0].id,
      },
    });
    await prisma.user.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id: users[1].id,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/users/my')
      .set('Authorization', accessToken);
    const { status, body }: ResponseResult<UserDetailResponse> = response;

    expect(status).toEqual(200);
    expect(body.friendCount).toEqual(8);
  });
});
