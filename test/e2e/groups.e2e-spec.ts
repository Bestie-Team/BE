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

  afterEach(async () => {
    await prisma.groupParticipation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /groups - 그룹 생성', () => {
    it('그룹 생성 정상 동작', async () => {
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

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const groupParticipationStdDate1 = new Date('2025-01-01T00:00:00.000Z');
      const groupParticipationStdDate2 = new Date('2025-01-01T12:00:00.000Z');
      const groupParticipationStdDate3 = new Date('2024-12-21T12:00:00.000Z');
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
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const group1 = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const group1Participation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group1.id,
          user1.id,
          groupParticipationStdDate2,
        ),
      });
      const group1Participation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group1.id,
          user2.id,
          groupParticipationStdDate2,
        ),
      });
      const group1Participation3 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group1.id,
          user3.id,
          groupParticipationStdDate2,
        ),
      });
      const group2 = await prisma.group.create({
        data: generateGroupEntity(user1.id, '안멋쟁이 그룹'),
      });
      const group2Participation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group2.id,
          loginedUser!.id,
          groupParticipationStdDate1,
        ),
      });
      const group3 = await prisma.group.create({
        data: generateGroupEntity(user2.id, '테스트 그룹'),
      });
      const group3Participation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group3.id,
          loginedUser!.id,
          groupParticipationStdDate3,
        ),
      });
      const expectedGroups = [group1, group2, group3];

      const cursor = new Date('2025-01-01T12:00:00.001Z').toISOString();
      const limit = 3;

      // when
      const response = await request(app.getHttpServer())
        .get(`/groups?cursor=${cursor}&limit=${limit}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GroupListResponse> = response;
      const { groups, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual(groupParticipationStdDate3.toISOString());
      groups.forEach((group, i) => {
        expect(group.id).toEqual(expectedGroups[i].id);
        expect(group.name).toEqual(expectedGroups[i].name);
        expect(group.description).toEqual(expectedGroups[i].description);
        expect(group.gatheringCount).toEqual(expectedGroups[i].gatheringCount);
      });
      // 멤버도 검증해야하는데 귀찮다...
    });
  });

  describe('(POST) /groups/{groupId}/members - 그룹원 추가', () => {
    it('그룹원 추가 정상 동작', async () => {
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
        data: generateUserEntity('test3@test.com', 'lighty_3', '이진수'), // 2
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
      const newMemberId = user3.id;
      const dto: AddGroupMemberRequest = {
        userId: newMemberId,
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
      expect(members.length).toEqual(3);
    });

    it('친구가 아닌 회원을 추가하려고 하는 경우 예외', async () => {
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
        userId: nonFriendUserId,
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
});
