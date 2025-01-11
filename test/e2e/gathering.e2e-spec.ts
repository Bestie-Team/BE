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
  generateFriendEntity,
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { CreateGatheringRequest } from 'src/presentation/dto/gathering/request/create-gathering.request';

describe('GatheringsController (e2e)', () => {
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
    await prisma.gatheringParticipation.deleteMany();
    await prisma.gathering.deleteMany();
    await prisma.groupParticipation.deleteMany();
    await prisma.group.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /gatherings - 모임 생성', () => {
    it('친구 모임 생성 정상 동작', async () => {
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

      const dto: CreateGatheringRequest = {
        name: '크리스마스 모임',
        address: '내집',
        description: '크리스마스 모임입니다~~',
        friendIds: [user1.id, user2.id, user3.id],
        gatheringDate: '2025-12-25T00:00:00.000Z',
        groupId: null,
        invitationImageUrl: 'https://image.com',
        type: 'FRIEND',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/gatherings')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<SearchUserResponse> = response;

      expect(status).toEqual(201);
    });

    it('그룹 모임 생성 정상 동작', async () => {
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
      const groupParticipation1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user1.id, new Date()),
      });
      const groupParticipation2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });
      const groupParticipation3 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user3.id, new Date()),
      });

      const dto: CreateGatheringRequest = {
        name: '크리스마스 모임',
        address: '내집',
        description: '크리스마스 모임입니다~~',
        friendIds: null,
        gatheringDate: '2025-12-25T00:00:00.000Z',
        groupId: group.id,
        invitationImageUrl: 'https://image.com',
        type: 'GROUP',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/gatherings')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<SearchUserResponse> = response;

      expect(status).toEqual(201);
    });
  });

  describe('(POST) /gatherings/{:invitationId}/accept - 모임 초대 수락', () => {
    it('모임 초대 수락 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(user1.id),
      });
      const gatheringInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          loginedUser!.id,
        ),
      });

      const response = await request(app.getHttpServer())
        .post(`/gatherings/${gatheringInvitation.id}/accept`)
        .set('Authorization', accessToken);
      const { status } = response;
      const acceptedInvitation = await prisma.gatheringParticipation.findUnique(
        {
          where: {
            id: gatheringInvitation.id,
          },
        },
      );

      expect(status).toEqual(201);
      expect(acceptedInvitation?.status).toEqual('ACCEPTED');
    });
  });

  describe('(POST) /gatherings/{:invitationId}/reject - 모임 초대 거절', () => {
    it('모임 초대 거절 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'), // 4
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(user1.id),
      });
      const gatheringInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          loginedUser!.id,
        ),
      });

      const response = await request(app.getHttpServer())
        .post(`/gatherings/${gatheringInvitation.id}/reject`)
        .set('Authorization', accessToken);
      const { status } = response;
      const acceptedInvitation = await prisma.gatheringParticipation.findUnique(
        {
          where: {
            id: gatheringInvitation.id,
          },
        },
      );

      expect(status).toEqual(201);
      expect(acceptedInvitation).toBeNull();
    });
  });
});
