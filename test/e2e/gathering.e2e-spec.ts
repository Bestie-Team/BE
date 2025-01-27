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
import { GatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/gathering-invitation-list.response';
import { GatheringListResponse } from 'src/presentation/dto/gathering/response/gathering-list.response';
import { GatheringDetail } from 'src/domain/types/gathering.types';
import { User } from '@prisma/client';

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

    // 그룹 멤버를 조회하여 초대를 생성할 때, 자신도 그룹의 멤버이기 떄문에 포함되는 경우가 있었음.
    it('그룹 모임 생성 시 자신에 대한 초대는 생성하지 않는다', async () => {
      const { accessToken, accountId } = await login(app);
      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const users = Array.from({ length: 10 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}_id`),
      );
      await prisma.user.createMany({ data: users });

      const ownGroup = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id),
      });
      const notOwnGroup = await prisma.group.create({
        data: generateGroupEntity(users[9].id),
      });
      const ownGroupParticipations = Array.from({ length: 8 }, (_, i) =>
        generateGroupParticipationEntity(ownGroup.id, users[i].id, new Date()),
      );
      await prisma.groupParticipation.createMany({
        data: ownGroupParticipations,
      });
      const notOwnGroupParticipations = Array.from({ length: 8 }, (_, i) =>
        generateGroupParticipationEntity(
          notOwnGroup.id,
          users[i].id,
          new Date(),
        ),
      );
      const loginedUserParticipation = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          notOwnGroup.id,
          loginedUser!.id,
          new Date(),
        ),
      });
      await prisma.groupParticipation.createMany({
        data: notOwnGroupParticipations,
      });

      const dto = (groupId: string): CreateGatheringRequest => ({
        name: '크리스마스 모임',
        address: '내집',
        description: '크리스마스 모임입니다~~',
        friendIds: null,
        gatheringDate: '2025-12-25T00:00:00.000Z',
        groupId,
        invitationImageUrl: 'https://image.com',
        type: 'GROUP',
      });

      const ownGroupResponse = await request(app.getHttpServer())
        .post('/gatherings')
        .send(dto(ownGroup.id))
        .set('Authorization', accessToken);
      const { status: ownStatus }: ResponseResult<SearchUserResponse> =
        ownGroupResponse;
      const notOwnGroupResponse = await request(app.getHttpServer())
        .post('/gatherings')
        .send(dto(notOwnGroup.id))
        .set('Authorization', accessToken);
      const { status: notOwnStatus }: ResponseResult<SearchUserResponse> =
        notOwnGroupResponse;

      const ownParticipations = await prisma.gatheringParticipation.findMany({
        where: { participantId: loginedUser!.id },
      });

      expect(ownStatus).toEqual(201);
      expect(notOwnStatus).toEqual(201);
      expect(ownParticipations.length).toEqual(0);
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

  describe('(GET) /gatherings/invitations/received - 받은 모임 초대 목록 조회', () => {
    it('받은 모임 초대 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const receivedFirst = new Date('2025-01-01T00:00:00.000Z');
      const receivedSecond = new Date('2025-12-31T23:59:58.000Z');
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'),
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '조민수'),
      });
      const friendRealtion1 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user1.id, 'ACCEPTED'),
      });
      const friendRealtion2 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user2.id, 'ACCEPTED'),
      });
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(user1.id, '멋진 그룹'),
      });
      const groupPart1 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(group.id, user2.id, new Date()),
      });
      const groupPart2 = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group.id,
          loginedUser!.id,
          new Date(),
        ),
      });
      const gathering1 = await prisma.gathering.create({
        data: generateGatheringEntity(
          user1.id,
          new Date(),
          '멋진 모임',
          new Date(),
          '두리집',
          '멋진 모임입니다.',
          'https://image.com',
          'GROUP',
          group.id,
        ),
      });
      const gathering1Invitation1 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering1.id,
          loginedUser!.id,
          'PENDING',
          receivedFirst,
        ),
      });
      const gathering1Invitation2 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(gathering1.id, user2.id),
      });
      const gathering1Invitation3 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(gathering1.id, user3.id),
      });
      const gathering2 = await prisma.gathering.create({
        data: generateGatheringEntity(user2.id, new Date(), '모임', new Date()),
      });
      const gathering2Invitation1 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering2.id,
          loginedUser!.id,
          'PENDING',
          receivedSecond,
        ),
      });
      const gathering2Invitation2 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(gathering2.id, user1.id),
      });
      const gathering2Invitation3 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(gathering2.id, user3.id),
      });
      const expectedGathering = [gathering2, gathering1];

      // 날짜 범위: 2025년
      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      // 마지막 모임 초대 이후 날짜
      const cursor = new Date('2026-01-01T00:00:00.000Z').toISOString();
      const limit = 2;

      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/invitations/received?cursor=${cursor}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringInvitationListResponse> =
        response;
      const { invitations, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual(receivedFirst.toISOString());
      invitations.forEach((invitation, i) => {
        expect(invitation.address).toEqual(expectedGathering[i].address);
        expect(invitation.name).toEqual(expectedGathering[i].name);
        expect(invitation.description).toEqual(
          expectedGathering[i].description,
        );
        expect(invitation.gatheringDate).toEqual(
          expectedGathering[i].gatheringDate.toISOString(),
        );
      });
      expect(invitations[0].id).toEqual(gathering2Invitation1.id);
      expect(invitations[0].members.length).toEqual(2);
      expect(invitations[0].createdAt).toEqual(
        gathering2Invitation1.createdAt.toISOString(),
      );
      expect(invitations[1].id).toEqual(gathering1Invitation1.id);
      expect(invitations[1].members.length).toEqual(2);
      expect(invitations[1].createdAt).toEqual(
        gathering1Invitation1.createdAt.toISOString(),
      );
    });
  });

  describe('(GET) /gatherings/invitations/sent - 보낸 모임 초대 목록 조회', () => {
    it('보낸 모임 초대 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const sentGroup1Invitation = new Date('2025-01-01T00:00:00.000Z');
      const sentGroup2Invitation = new Date('2025-01-05T00:00:00.000Z');

      const users: User[] = [];
      for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
          data: generateUserEntity(
            `test${i}@test.com`,
            `account${i}`,
            `이민수${i}`,
          ),
        });
        users.push(user);
      }
      for (let i = 0; i < 10; i++) {
        await prisma.friend.create({
          data: generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
        });
      }
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id),
      });
      // 모두와 친구다 난
      const gathering1 = await prisma.gathering.create({
        data: generateGatheringEntity(
          loginedUser!.id,
          sentGroup1Invitation,
          '두리집 오전 청소 모임',
          new Date(),
          '집',
          '못진ㅁ ㅗ임',
          'https://image.com',
          'GROUP',
          group.id,
        ),
      });
      const gathering2 = await prisma.gathering.create({
        data: generateGatheringEntity(
          loginedUser!.id,
          sentGroup2Invitation,
          '두리집 오후 청소 모임',
        ),
      });
      for (let i = 0; i < 5; i++) {
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(
            gathering1.id,
            users[i].id,
          ),
        });
      }
      for (let i = 0; i < 5; i++) {
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(
            gathering2.id,
            users[i].id,
          ),
        });
      }
      const expectedGathering = [gathering2, gathering1];

      // 날짜 범위: 2025년
      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      // 마지막 모임 초대 이후 날짜
      const cursor = new Date('2025-01-05T14:59:59.000Z').toISOString();
      const limit = 2;

      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/invitations/sent?cursor=${cursor}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringInvitationListResponse> =
        response;
      const { invitations, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual(sentGroup1Invitation.toISOString());
      invitations.forEach((invitation, i) => {
        expect(invitation.address).toEqual(expectedGathering[i].address);
        expect(invitation.name).toEqual(expectedGathering[i].name);
        expect(invitation.description).toEqual(
          expectedGathering[i].description,
        );
        expect(invitation.gatheringDate).toEqual(
          expectedGathering[i].gatheringDate.toISOString(),
        );
      });
      expect(invitations[0].id).toEqual(gathering2.id);
      expect(invitations[0].members.length).toEqual(5);
      expect(invitations[0].createdAt).toEqual(
        gathering2.createdAt.toISOString(),
      );
      expect(invitations[1].id).toEqual(gathering1.id);
      expect(invitations[1].members.length).toEqual(5);
      expect(invitations[1].createdAt).toEqual(
        gathering1.createdAt.toISOString(),
      );
    });
  });

  describe('(GET) /gatherings - 참여 중인 모임 목록 조회', () => {
    it('모임 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const stdDate = new Date('2024-12-10T00:00:00.000Z');
      const firstGatheringDate = new Date('2025-01-01T00:00:00.000Z');
      const seondGatheringDate = new Date('2025-05-31T23:59:59.000Z');
      const thirdGatheringDate = new Date('2025-12-31T23:59:59.000Z');
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'),
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '조민수'),
      });
      const gathering1 = await prisma.gathering.create({
        data: generateGatheringEntity(
          loginedUser!.id,
          stdDate,
          '두리 모임1',
          firstGatheringDate,
        ),
      });
      const gathering2 = await prisma.gathering.create({
        data: generateGatheringEntity(
          user1.id,
          stdDate,
          '두리 모임2',
          thirdGatheringDate,
        ),
      });
      const gathering3 = await prisma.gathering.create({
        data: generateGatheringEntity(
          loginedUser!.id,
          stdDate,
          '두리 모임3',
          seondGatheringDate,
        ),
      });
      const gathering1Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(
            gathering1.id,
            loginedUser!.id,
            'ACCEPTED',
          ),
        });
      const gathering2Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(
            gathering2.id,
            loginedUser!.id,
            'ACCEPTED',
          ),
        });
      const gathering3Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(
            gathering3.id,
            user3.id,
            'ACCEPTED',
          ),
        });
      const expectedGathering = [gathering1, gathering3, gathering2];
      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      const cursor = minDate;
      const limit = 3;

      const response = await request(app.getHttpServer())
        .get(
          `/gatherings?cursor=${cursor}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringListResponse> = response;
      const { gatherings, nextCursor } = body;

      expect(status).toEqual(status);
      gatherings.forEach((gathering, i) => {
        expect(gathering.id).toEqual(expectedGathering[i].id);
        expect(gathering.name).toEqual(expectedGathering[i].name);
        expect(gathering.gatheringDate).toEqual(
          expectedGathering[i].gatheringDate.toISOString(),
        );
        expect(gathering.invitationImageUrl).toEqual(
          expectedGathering[i].invitationImageUrl,
        );
      });
      expect(nextCursor).toEqual(
        expectedGathering.at(-1)?.gatheringDate.toISOString(),
      );
    });
  });

  describe('(GET) /gatherings/{gatheringId} - 모임 상세 조회', () => {
    it('모임 상세 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findUnique({
        where: {
          accountId,
        },
      });
      const stdDate = new Date('2024-12-10T00:00:00.000Z');
      const gatheringDate = new Date('2025-01-01T00:00:00.000Z');
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'),
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '조민수'),
      });
      const gathering1 = await prisma.gathering.create({
        data: generateGatheringEntity(
          loginedUser!.id,
          stdDate,
          '두리 모임',
          gatheringDate,
        ),
      });
      const gathering1Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(gathering1.id, user1.id),
        });
      const gathering2Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(gathering1.id, user2.id),
        });
      const gathering3Participation =
        await prisma.gatheringParticipation.create({
          data: generateGatheringParticipationEntity(gathering1.id, user3.id),
        });

      const response = await request(app.getHttpServer())
        .get(`/gatherings/${gathering1.id}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringDetail> = response;
      const { hostUser, members } = body;

      expect(status).toEqual(status);
      expect(body.id).toEqual(gathering1.id);
      expect(body.name).toEqual(gathering1.name);
      expect(body.address).toEqual(gathering1.address);
      expect(body.description).toEqual(gathering1.description);
      expect(body.invitationImageUrl).toEqual(gathering1.invitationImageUrl);
      expect(body.gatheringDate).toEqual(
        gathering1.gatheringDate.toISOString(),
      );
      expect(hostUser.id).toEqual(loginedUser!.id);
      expect(hostUser.accountId).toEqual(loginedUser!.accountId);
      expect(hostUser.name).toEqual(loginedUser!.name);
      expect(hostUser.profileImageUrl).toEqual(loginedUser!.profileImageUrl);
      expect(members.length).toEqual(3);
    });
  });
});
