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
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { CreateGatheringRequest } from 'src/presentation/dto/gathering/request/create-gathering.request';
import { ReceivedGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/received-gathering-invitation-list.response';
import { GatheringListResponse } from 'src/presentation/dto/gathering/response/gathering-list.response';
import { GatheringDetail } from 'src/domain/types/gathering.types';
import { User } from '@prisma/client';
import { UpdateGatheringRequest } from 'src/presentation/dto/gathering/request/update-gathering.request';
import { EndedGatheringsListResponse } from 'src/presentation/dto/gathering/response/ended-gatherings-list.response';
import { SentGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/sent-gathering-invitation-list.response';
import {
  AcceptGatheringInvitationRequest,
  RejectGatheringInvitationRequest,
} from 'src/presentation/dto';
import { send } from 'process';

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

  afterAll(() => {
    app.close();
  });

  afterEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.feed.deleteMany();
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
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });

      const dto: CreateGatheringRequest = {
        name: '크리스마스 모임',
        address: '내집',
        description: '크리스마스 모임입니다~~',
        friendIds: [user1.id, user2.id, user3.id],
        gatheringDate: new Date(Date.now() + 10000).toISOString(),
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
      const invitations = await prisma.gatheringParticipation.findMany();

      expect(status).toEqual(201);
      // 자신도 포함해서 4개
      expect(invitations.length).toEqual(4);
    });

    it('그룹 모임 생성 정상 동작', async () => {
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
      const friendRealtion3 = await prisma.friend.create({
        data: generateFriendEntity(loginedUser!.id, user3.id, 'ACCEPTED'),
      });
      const group = await prisma.group.create({
        data: generateGroupEntity(loginedUser!.id, '멋쟁이 그룹'),
      });
      const myGroupParticipation = await prisma.groupParticipation.create({
        data: generateGroupParticipationEntity(
          group.id,
          loginedUser!.id,
          new Date(),
        ),
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
      const invitations = await prisma.gatheringParticipation.findMany();

      expect(status).toEqual(201);
      expect(invitations.length).toEqual(4);
    });
  });

  describe('(POST) /gatherings/{:invitationId}/accept - 모임 초대 수락', () => {
    it('모임 초대 수락 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
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

      const dto: AcceptGatheringInvitationRequest = {
        gatheringId: gathering.id,
        invitationId: gatheringInvitation.id,
      };

      const response = await request(app.getHttpServer())
        .post(`/gatherings/accept`)
        .send(dto)
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

      const loginedUser = await prisma.user.findFirst({
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

      const dto: RejectGatheringInvitationRequest = {
        invitationId: gatheringInvitation.id,
      };

      const response = await request(app.getHttpServer())
        .post(`/gatherings/reject`)
        .send(dto)
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

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const users = Array.from({ length: 20 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}`, `김철수${i}`),
      );
      await prisma.user.createMany({ data: users });

      const inviteDates = [
        new Date('2025-01-12T00:00:00.000Z'),
        new Date('2025-02-12T23:59:58.000Z'),
        new Date('2025-05-12T23:59:58.000Z'),
        new Date('2025-08-12T23:59:58.000Z'),
        new Date('2025-11-12T23:59:58.000Z'),
      ];

      const gatherings = Array.from({ length: 10 }, (_, i) =>
        generateGatheringEntity(
          users[i].id,
          new Date(),
          `두리집 청소 모임${i}`,
        ),
      );
      await prisma.gathering.createMany({ data: gatherings });

      // 10개의 그룹에서 9개에 초대.
      const myGatheringInvitations = Array.from({ length: 9 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i].id,
          loginedUser!.id,
          'PENDING',
          inviteDates[i % inviteDates.length],
        ),
      );
      // 나와 관련 없는 타회원의 초대 데이터 (조회에 영향 주면 안 됨)
      const otherGatheringInvitations = Array.from({ length: 20 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i % gatherings.length].id,
          users[i].id,
          'PENDING',
          inviteDates[i],
        ),
      );
      await prisma.gatheringParticipation.createMany({
        data: [...myGatheringInvitations, ...otherGatheringInvitations],
      });

      const expectedInvitations = myGatheringInvitations.sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;

        return a.id.localeCompare(b.id);
      });

      // 날짜 범위: 2025년
      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: new Date('2025-11-12T23:59:58.000Z').toISOString(),
        id: '00000000-0000-4000-8000-000000000000',
      };
      const limit = 10;

      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/invitations/received?cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const {
        status,
        body,
      }: ResponseResult<ReceivedGatheringInvitationListResponse> = response;
      const { invitations, nextCursor } = body;

      expect(status).toEqual(200);
      expect(invitations.length).toEqual(expectedInvitations.length);
      expect(nextCursor).toBeNull();
      invitations.forEach((invitation, i) => {
        expect(invitation.id).toEqual(expectedInvitations[i].id);
        expect(invitation.groupName).toBeNull();
        expect(invitation.createdAt).toEqual(
          expectedInvitations[i].createdAt.toISOString(),
        );
      });
    });
  });

  describe('(GET) /gatherings/invitations/sent - 보낸 모임 초대 목록 조회', () => {
    it('보낸 모임 초대 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
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
      const cursor = {
        createdAt: maxDate,
        id: '256f6dd3-bb65-4b96-a455-df4144fbec65',
      };
      const limit = 2;

      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/invitations/sent?cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const {
        status,
        body,
      }: ResponseResult<SentGatheringInvitationListResponse> = response;
      const { invitations, nextCursor } = body;

      expect(status).toEqual(200);
      // expect(nextCursor?.createdAt).toEqual({
      //   createdAt: sentGroup1Invitation.toISOString(),
      // });
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
    });
  });

  describe('(GET) /gatherings - 참여 중인 모임 목록 조회', () => {
    it('모임 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const stdDate = new Date('2024-12-10T00:00:00.000Z');
      const gatheringDates = [
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-05-31T23:59:59.000Z'),
        new Date('2025-12-31T23:59:59.000Z'),
      ];
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'),
      });
      const user3 = await prisma.user.create({
        data: generateUserEntity('test3@test.com', 'lighty_3', '조민수'),
      });

      // 0 ~ 2 까지 owner.
      const gatherings = Array.from({ length: 15 }, (_, i) =>
        generateGatheringEntity(
          i < 3 ? loginedUser!.id : user1.id,
          stdDate,
          `두리 모임${i}`,
          gatheringDates[i % 3],
        ),
      );
      await prisma.gathering.createMany({ data: gatherings });
      // 자신이 owner인 모임 참여 데이터 생성
      const ownGatheringParticipations = Array.from({ length: 3 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임3 ~ 7 참여.
      const acceptedGatherings = Array.from({ length: 5 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 3].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임8, 9는 수락 대기 상태.
      const pendingGatherings = Array.from({ length: 2 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 8].id,
          loginedUser!.id,
          'PENDING',
        ),
      );
      // 타회원 무작위 참여.
      const otherUserParticipation = Array.from({ length: 20 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i % gatherings.length].id,
          i % 2 === 1 ? user2.id : user3.id,
          'ACCEPTED',
        ),
      );
      await prisma.gatheringParticipation.createMany({
        data: [
          ...ownGatheringParticipations,
          ...acceptedGatherings,
          ...pendingGatherings,
          ...otherUserParticipation,
        ],
      });

      // i < 3: 오너인 모임, i < 8 참여 중인 모임.
      const expectedGathering = gatherings
        .filter((_, i) => i < 8)
        .sort(
          (a, b) =>
            b.gatheringDate.getTime() - a.gatheringDate.getTime() ||
            a.id.localeCompare(b.id),
        );

      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: maxDate,
        id: '256f6dd3-bb65-4b96-a455-df4144fbec65',
      };
      const limit = 8;

      // when
      const response = await request(app.getHttpServer())
        .get(
          `/gatherings?cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringListResponse> = response;
      const { gatherings: resGatherings, nextCursor } = body;

      expect(status).toEqual(200);
      resGatherings.forEach((gathering, i) => {
        expect(gathering.id).toEqual(expectedGathering[i].id);
        expect(gathering.name).toEqual(expectedGathering[i].name);
        expect(gathering.gatheringDate).toEqual(
          expectedGathering[i].gatheringDate.toISOString(),
        );
        expect(gathering.invitationImageUrl).toEqual(
          expectedGathering[i].invitationImageUrl,
        );
      });
      expect(nextCursor).toEqual({
        createdAt: expectedGathering.at(-1)?.gatheringDate.toISOString(),
        id: expectedGathering.at(-1)?.id,
      });
    });
  });

  describe('(GET) /gatherings/no-feed - 피드를 작성하지 않은 완료된 모임 조회', () => {
    it('피드를 작성하지 않은 완료된 모임 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const stdDate = new Date('2024-12-10T00:00:00.000Z');
      const gatheringDates = [
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-05-31T23:59:59.000Z'),
        new Date('2025-12-31T23:59:59.000Z'),
      ];
      const users = Array.from({ length: 4 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}_id`, `이름${i}`),
      );
      await prisma.user.createMany({ data: users });

      // 0 ~ 2 까지 owner.
      const gatherings = Array.from({ length: 15 }, (_, i) =>
        generateGatheringEntity(
          i < 3 ? loginedUser!.id : users[i % users.length].id,
          stdDate,
          `두리 모임${i}`,
          gatheringDates[i % 3],
        ),
      );
      await prisma.gathering.createMany({ data: gatherings });

      // 자신이 owner인 모임 참여 데이터 생성
      const ownGatheringParticipations = Array.from({ length: 3 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임3 ~ 7 참여.
      const acceptedGatherings = Array.from({ length: 5 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 3].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임8, 9는 수락 대기 상태.
      const pendingGatherings = Array.from({ length: 2 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 8].id,
          loginedUser!.id,
          'PENDING',
        ),
      );
      // 타회원 무작위 참여.
      const otherUserParticipation = Array.from({ length: 20 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i % gatherings.length].id,
          users[i % users.length].id,
          'ACCEPTED',
        ),
      );
      await prisma.gatheringParticipation.createMany({
        data: [
          ...ownGatheringParticipations,
          ...acceptedGatherings,
          ...pendingGatherings,
          ...otherUserParticipation,
        ],
      });

      // 모임0 ~ 5 완료 처리.
      for (let i = 0; i < 5; i++) {
        await prisma.gathering.update({
          data: {
            endedAt: new Date(),
          },
          where: {
            id: gatherings[i].id,
          },
        });
      }

      // 모임 0에 피드 작성
      await prisma.feed.create({
        data: generateFeedEntity(loginedUser!.id, gatherings[0].id),
      });

      const expectedGatherings = gatherings
        .filter((_, i) => i !== 0 && i < 5)
        .sort(
          (a, b) =>
            b.gatheringDate.getTime() - a.gatheringDate.getTime() ||
            a.id.localeCompare(b.id),
        );

      // when
      const cursor = {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        id: '256f6dd3-bb65-4b96-a455-df4144fbec65',
      };
      const limit = 5;

      // when
      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/no-feed?cursor=${JSON.stringify(cursor)}&limit=${limit}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringListResponse> = response;
      const { gatherings: resGatherings, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual(null);
      expect(resGatherings.length).toEqual(expectedGatherings.length);
      resGatherings.forEach((gathering, i) => {
        expect(gathering.id).toEqual(expectedGatherings[i].id);
        expect(gathering.name).toEqual(expectedGatherings[i].name);
        expect(gathering.description).toEqual(
          expectedGatherings[i].description,
        );
        expect(gathering.gatheringDate).toEqual(
          expectedGatherings[i].gatheringDate.toISOString(),
        );
        expect(gathering.invitationImageUrl).toEqual(
          expectedGatherings[i].invitationImageUrl,
        );
      });
    });
  });

  describe('(GET) /gatherings/ended - 완료된 모임 조회', () => {
    it('완료된 모임 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const stdDate = new Date('2024-12-10T00:00:00.000Z');
      const gatheringDates = [
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-05-31T23:59:59.000Z'),
        new Date('2025-12-31T23:59:59.000Z'),
      ];
      const users = Array.from({ length: 4 }, (_, i) =>
        generateUserEntity(`test${i}@test.com`, `account${i}_id`, `이름${i}`),
      );
      await prisma.user.createMany({ data: users });

      // 0 ~ 2 까지 owner.
      const gatherings = Array.from({ length: 15 }, (_, i) =>
        generateGatheringEntity(
          i < 3 ? loginedUser!.id : users[i % users.length].id,
          stdDate,
          `두리 모임${i}`,
          gatheringDates[i % 3],
        ),
      );
      await prisma.gathering.createMany({ data: gatherings });

      // 자신이 owner인 모임 참여 데이터 생성
      const ownGatheringParticipations = Array.from({ length: 3 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임3 ~ 7 참여.
      const acceptedGatherings = Array.from({ length: 5 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 3].id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      );
      // 모임8, 9는 수락 대기 상태.
      const pendingGatherings = Array.from({ length: 2 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i + 8].id,
          loginedUser!.id,
          'PENDING',
        ),
      );
      // 타회원 무작위 참여.
      const otherUserParticipation = Array.from({ length: 20 }, (_, i) =>
        generateGatheringParticipationEntity(
          gatherings[i % gatherings.length].id,
          users[i % users.length].id,
          'ACCEPTED',
        ),
      );
      await prisma.gatheringParticipation.createMany({
        data: [
          ...ownGatheringParticipations,
          ...acceptedGatherings,
          ...pendingGatherings,
          ...otherUserParticipation,
        ],
      });

      // 모임0 ~ 5 완료 처리.
      for (let i = 0; i < 5; i++) {
        await prisma.gathering.update({
          data: {
            endedAt: new Date(),
          },
          where: {
            id: gatherings[i].id,
          },
        });
      }

      // 완료된 모임에 피드 작성
      const myFeeds = Array.from({ length: 3 }, (_, i) =>
        generateFeedEntity(loginedUser!.id, gatherings[i].id),
      );
      // 타회원이 피드 작성
      const otherUserFeeds = Array.from({ length: 2 }, (_, i) =>
        generateFeedEntity(users[i].id, gatherings[3 + i].id),
      );
      await prisma.feed.createMany({ data: [...myFeeds, ...otherUserFeeds] });

      const expectedGatherings = gatherings
        .filter((_, i) => i < 5)
        .sort(
          (a, b) =>
            b.gatheringDate.getTime() - a.gatheringDate.getTime() ||
            a.id.localeCompare(b.id),
        );

      const minDate = new Date('2025-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2025-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: maxDate,
        id: '256f6dd3-bb65-4b96-a455-df4144fbec65',
      };
      const limit = 8;

      // when
      const response = await request(app.getHttpServer())
        .get(
          `/gatherings/ended?cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}&minDate=${minDate}&maxDate=${maxDate}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<EndedGatheringsListResponse> =
        response;
      const { gatherings: resGatherings, nextCursor } = body;

      expect(status).toEqual(200);
      expect(nextCursor).toEqual(null);
      expect(resGatherings.length).toEqual(expectedGatherings.length);
      resGatherings.forEach((gathering, i) => {
        expect(gathering.id).toEqual(expectedGatherings[i].id);
        expect(gathering.name).toEqual(expectedGatherings[i].name);
        expect(gathering.description).toEqual(
          expectedGatherings[i].description,
        );
        expect(gathering.gatheringDate).toEqual(
          expectedGatherings[i].gatheringDate.toISOString(),
        );
        expect(gathering.invitationImageUrl).toEqual(
          expectedGatherings[i].invitationImageUrl,
        );
        if (
          gathering.name.includes('0') ||
          gathering.name.includes('1') ||
          gathering.name.includes('2')
        ) {
          expect(gathering.isFeedPosted).toBeTruthy();
        } else {
          expect(gathering.isFeedPosted).toBeFalsy();
        }
      });
    });
  });

  // NOTE 손보기
  describe('(GET) /gatherings/{gatheringId} - 모임 상세 조회', () => {
    it('모임 상세 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
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

    it('모임장이 탈퇴한 경우 탈퇴한 회원으로 노출되어야 한다.', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user1 = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '이민수'),
      });
      const user2 = await prisma.user.create({
        data: generateUserEntity('test2@test.com', 'lighty_2', '김민수'),
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(
          user1.id,
          new Date(),
          '두리 모임',
          new Date(),
        ),
      });
      const hostParticipation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          user1.id,
          'ACCEPTED',
        ),
      });
      const otherParticipation1 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          user2.id,
          'ACCEPTED',
        ),
      });
      const otherParticipation2 = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          gathering.id,
          loginedUser!.id,
          'ACCEPTED',
        ),
      });

      // 모임장 탈퇴
      await prisma.user.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: user1.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/gatherings/${gathering.id}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<GatheringDetail> = response;

      expect(status).toEqual(200);
      expect(body.hostUser.id).toEqual('');
      expect(body.hostUser.accountId).toEqual('탈퇴한 사용자');
      expect(body.hostUser.name).toEqual('');
      expect(body.hostUser.profileImageUrl).toBeNull();
    });
  });

  describe('(DELETE) /gatherings/{gatheringId} - 모임 삭제', () => {
    it('모임 삭제 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id, new Date()),
      });

      const response = await request(app.getHttpServer())
        .delete(`/gatherings/${gathering.id}`)
        .set('Authorization', accessToken);
      const { status } = response;
      const participations = await prisma.gatheringParticipation.findMany();

      expect(status).toEqual(204);
      expect(participations.length).toEqual(0);
    });

    it('모임장이 아닌 회원이 삭제하려는 경우 예외', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const owner = await prisma.user.create({
        data: generateUserEntity('membet@test.com', 'member_id'),
      });

      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(owner.id, new Date()),
      });
      const gatheringParticipation = await prisma.gatheringParticipation.create(
        {
          data: generateGatheringParticipationEntity(
            gathering.id,
            loginedUser!.id,
          ),
        },
      );

      const response = await request(app.getHttpServer())
        .delete(`/gatherings/${gathering.id}`)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(404);
    });

    it('완료된 모임을 삭제하려는 경우 실패', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id, new Date()),
      });
      await prisma.gathering.update({
        data: { endedAt: new Date() },
        where: {
          id: gathering.id,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/gatherings/${gathering.id}`)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(422);
    });
  });

  describe('(PATCH) /gatherings/{gatheringId} - 모임 수정', () => {
    it('모임 수정 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id, new Date()),
      });

      const dto: UpdateGatheringRequest = {
        name: '변경된 이름',
        address: '변경된 주소',
        description: '변경된 설명',
        gatheringDate: new Date(Date.now() + 10000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .patch(`/gatherings/${gathering.id}`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(204);
    });
  });
});
