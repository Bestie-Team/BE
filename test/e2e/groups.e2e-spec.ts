/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Test, TestingModule } from '@nestjs/testing';
import { Body, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import {
  generateFriendEntity,
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { CreateGroupRequest } from 'src/presentation/dto/group/request/create-group.request';
import { ResponseResult } from 'test/helpers/types';
import { AddGroupMemberRequest, GroupListResponse } from 'src/presentation/dto';
import { Friend, User } from '@prisma/client';
import { UpdateGroupRequest } from 'src/presentation/dto/group/request/update-group.request';

describe('GroupsController (e2e)', () => {
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
    await prisma.groupParticipation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /groups - 그룹 생성', () => {
    it('그룹 생성 정상 동작', async () => {
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

      const dto: CreateGroupRequest = {
        name: '멋쟁이들의 모임',
        description: '멋쟁이만 출입 가능',
        friendIds: [user1.id, user2.id, user3.id, user4.id],
        groupImageUrl: 'https://image.com',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(201);
    });

    it('그룹 생성 시 친구가 아닌 회원 번호가 있는 경우 예외', async () => {
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
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });

      const dto: CreateGroupRequest = {
        name: '멋쟁이들의 모임',
        description: '멋쟁이만 출입 가능',
        friendIds: [user1.id, user2.id],
        groupImageUrl: 'https://image.com',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(400);
    });
  });

  describe('(GET) /groups - 참여 그룹 목록 조회', () => {
    it('그룹 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const users = Array.from({ length: 15 }, (_, i) =>
        generateUserEntity(`other${i}@test.com`, `other_${i}`, `김철수${i}`),
      );
      await prisma.user.createMany({
        data: users,
      });

      const stdDates = [
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-01-01T12:00:00.000Z'),
        new Date('2024-12-21T12:00:00.000Z'),
        new Date('2024-12-21T11:59:00.000Z'),
        new Date('2024-04-31T12:00:00.000Z'),
      ];
      // 내가 참여 중인 그룹
      // 내가 생성한 그룹
      const ownGroups = Array.from({ length: 5 }, (_, i) =>
        generateGroupEntity(loginedUser!.id, `내그룹${i}`),
      );
      const otherGroups = Array.from({ length: 5 }, (_, i) =>
        generateGroupEntity(users[i].id, `남그룹${i}`),
      );
      await prisma.group.createMany({
        data: [...ownGroups, ...otherGroups],
      });
      // 내가 그룹장인 그룹에 자신의 참여 데이터 생성
      const myOwnGroupParticipations = ownGroups.map((group, i) =>
        generateGroupParticipationEntity(
          group.id,
          loginedUser!.id,
          stdDates[i],
        ),
      );
      const myOtherGroupParticipations = otherGroups
        .map((group, i) =>
          generateGroupParticipationEntity(
            group.id,
            loginedUser!.id,
            stdDates[i],
          ),
        )
        .filter((_, i) => i < 4);
      // 내가 만든 그룹에 타회원 참여
      const otherUserOwnGroupParticipations1 = ownGroups.map((group, i) =>
        generateGroupParticipationEntity(
          group.id,
          users[i + 4].id,
          stdDates[i],
        ),
      );
      // 내가 만든 그룹에 타회원 참여
      const otherUserOwnGroupParticipations2 = ownGroups.map((group, i) =>
        generateGroupParticipationEntity(
          group.id,
          users[i + 9].id,
          stdDates[i],
        ),
      );
      // 타회원 자신이 만든 그룹에 자신 참여
      const otherGroupOwnerParticipations = otherGroups.map((group, i) =>
        generateGroupParticipationEntity(group.id, users[i].id, stdDates[i]),
      );
      // 타회원이 만든 그룹에 타회원이 참여
      const otherUserOtherGroupParticipations1 = otherGroups.map((group, i) =>
        generateGroupParticipationEntity(
          group.id,
          users[i + 4].id,
          stdDates[i],
        ),
      );
      // 타회원이 만든 그룹에 타회원이 참여
      const otherUserOtherGroupParticipations2 = otherGroups.map((group, i) =>
        generateGroupParticipationEntity(
          group.id,
          users[i + 9].id,
          stdDates[i],
        ),
      );
      const participations = [
        ...myOwnGroupParticipations,
        ...myOtherGroupParticipations,
        ...otherUserOwnGroupParticipations1,
        ...otherUserOwnGroupParticipations2,
        ...otherUserOtherGroupParticipations1,
        ...otherUserOtherGroupParticipations2,
      ];

      await prisma.groupParticipation.createMany({
        data: participations,
      });

      const cursor = new Date('2025-01-01T12:00:00.001Z').toISOString();
      const limit = 10;

      // when
      const response = await request(app.getHttpServer())
        .get(`/groups?cursor=${cursor}&limit=${limit}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GroupListResponse> = response;
      const { groups, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toBeNull();
      expect(groups.length).toEqual(9);
      groups.forEach((group) => {
        if (group.name.includes('내그룹')) {
          expect(group.members.length).toEqual(2);
        }
        if (group.name.includes('남그룹')) {
          expect(group.members.length).toEqual(3);
        }
      });
    });
  });

  describe('(POST) /groups/{groupId}/members - 그룹원 추가', () => {
    it('그룹원 추가 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const users: User[] = [];
      const friendRelations: Friend[] = [];
      for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
          data: generateUserEntity(
            `test${i}@test.com`,
            `account${i}_id`,
            `이민수${i}`,
          ),
        });
        users.push(user);
      }
      for (let i = 0; i < 10; i++) {
        const friendRelation = await prisma.friend.create({
          data: generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
        });
        friendRelations.push(friendRelation);
      }
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const group1Participation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group.id,
          users[9].id,
          new Date(),
        ),
      });
      users.pop();

      const groupId = group.id;
      const newMemberIds = users.map((user) => user.id);
      const dto: AddGroupMemberRequest = {
        userIds: newMemberIds,
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/groups/${groupId}/members`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;
      const members = await prisma.groupParticipation.findMany({
        where: {
          groupId,
        },
      });

      expect(status).toEqual(201);
      expect(members.length).toEqual(10);
    });

    it('그룹을 신고한 회원을 초대하려는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const users = Array.from({ length: 3 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}_id`),
      );
      await prisma.user.createMany({ data: users });

      const friendRelations = Array.from({ length: 3 }, (_, i) =>
        generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
      );
      await prisma.friend.createMany({ data: friendRelations });

      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });

      const acceptedGroupParticipations =
        await prisma.groupParticipation.create({
          data: generateGroupParticipationEntity(
            group.id,
            users[0].id,
            new Date(),
            'ACCEPTED',
          ),
        });
      const reportedGroupParticipations =
        await prisma.groupParticipation.create({
          data: generateGroupParticipationEntity(
            group.id,
            users[1].id,
            new Date(),
            'REPORTED',
          ),
        });

      const groupId = group.id;
      const newMemberIds = [users[1].id, users[2].id];
      const dto: AddGroupMemberRequest = {
        userIds: newMemberIds,
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/groups/${groupId}/members`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(422);
    });

    it('친구가 아닌 회원을 추가하려고 하는 경우 예외', async () => {
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
        data: generateUserEntity('test3@test.com', 'lighty_3', '이진수'), // 2
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const group1Participation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user1.id, new Date()),
      });
      const group1Participation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });
      const groupId = group.id;
      const nonFriendUserId = user3.id;
      const dto: AddGroupMemberRequest = {
        userIds: [nonFriendUserId],
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/groups/${groupId}/members`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(400);
    });
  });

  describe('(DELETE) /groups/{groupId}/members - 그룹 나가기', () => {
    it('그룹 나가기 정상 동작', async () => {
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
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(user1.id, '멋쟁이 그룹'),
      });
      const groupParticipation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });
      const groupParticipation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group.id,
          loginedUser!.id,
          new Date(),
        ),
      });

      const groupId = group.id;

      // when
      const response = await request(app.getHttpServer())
        .delete(`/groups/${groupId}/members`)
        .set('Authorization', accessToken);
      const { status } = response;
      const groupParticipation = await prisma.groupParticipation.findMany({
        where: {
          groupId,
        },
      });

      expect(status).toEqual(204);
      expect(groupParticipation.length).toEqual(1);
    });

    it('그룹장이 그룹을 나가려는 경우 예외', async () => {
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
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const groupParticipation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user1.id, new Date()),
      });
      const groupParticipation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });

      const groupId = group.id;

      // when
      const response = await request(app.getHttpServer())
        .delete(`/groups/${groupId}/members`)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(400);
    });
  });

  describe('(DELETE) /groups/:groupId - 그룹 삭제', () => {
    it('그룹 삭제 정상 동작', async () => {
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
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const groupParticipation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user1.id, new Date()),
      });
      const groupParticipation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });

      const groupId = group.id;

      // when
      const response = await request(app.getHttpServer())
        .delete(`/groups/${groupId}`)
        .set('Authorization', accessToken);
      const { status } = response;
      const groupParticipations = await prisma.groupParticipation.findMany({
        where: {
          groupId,
        },
      });

      expect(status).toEqual(204);
      expect(groupParticipations.length).toEqual(0);
    });

    it('그룹장이 아닌 회원이 삭제하려는 경우 예외', async () => {
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
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(user2.id, loginedUser!.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(user1.id, '멋쟁이 그룹'),
      });
      const groupParticipation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user1.id, new Date()),
      });
      const groupParticipation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group.id,
          loginedUser!.id,
          new Date(),
        ),
      });

      const groupId = group.id;

      // when
      const response = await request(app.getHttpServer())
        .delete(`/groups/${groupId}`)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(403);
    });
  });

  describe('(PATCH) /groups/{id} - 그룹 정보 수정', () => {
    it('그룹 정보 수정 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const groupId = group.id;
      const dto: UpdateGroupRequest = {
        name: '변경된 그룹명',
        groupImageUrl: 'https://updated.com',
        description: '변경된 설명',
      };

      // when
      const response = await request(app.getHttpServer())
        .patch(`/groups/${groupId}`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(204);
    });
  });
});
