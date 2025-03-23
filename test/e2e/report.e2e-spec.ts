/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import {
  generateFeedCommentEntity,
  generateFeedEntity,
  generateFriendEntity,
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { CreateReportRequest } from 'src/presentation/dto/report/request/create-report.request';
import { ReportTypes } from 'src/shared/types';
import { ListenersModule } from 'src/infrastructure/event/listeners/listeners.module';
import { EmptyModule } from 'test/helpers/empty.module';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ListenersModule)
      .useModule(EmptyModule)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.blockedUser.deleteMany();
    await prisma.blockedFeedComment.deleteMany();
    await prisma.report.deleteMany();
    await prisma.gatheringParticipation.deleteMany();
    await prisma.gathering.deleteMany();
    await prisma.group.deleteMany();
    await prisma.feedComment.deleteMany();
    await prisma.feed.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(() => {
    app.close();
  });

  describe('(POST) /reports/{type} - 신고', () => {
    it('친구 신고 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: { accountId },
      });
      // 친구 관계 설정.
      const reportedUser = await prisma.user.create({
        data: generateUserEntity('test@test.com', 'account_id'),
      });
      const friendRelation = await prisma.friend.create({
        data: generateFriendEntity(
          loginedUser!.id,
          reportedUser.id,
          'ACCEPTED',
        ),
      });

      // 내가 만든 모임, 친구가 만든 모임 생성 후 초대 생성.
      const ownGathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id),
      });
      const friendGathering = await prisma.gathering.create({
        data: generateGatheringEntity(reportedUser.id),
      });
      const sentInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          ownGathering.id,
          reportedUser.id,
        ),
      });
      const receivedInvitation = await prisma.gatheringParticipation.create({
        data: generateGatheringParticipationEntity(
          friendGathering.id,
          loginedUser!.id,
        ),
      });

      const dto: CreateReportRequest = {
        reason: '자꾸 욕함.',
        reportedId: reportedUser.id,
        type: 'FRIEND',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/reports')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;
      const report = await prisma.report.findMany();
      const afterReportInvitation =
        await prisma.gatheringParticipation.findMany();

      expect(status).toEqual(201);
      expect(report.length).toEqual(1);
      expect(afterReportInvitation.length).toEqual(0);
    });

    it('댓글 신고 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: { accountId },
      });

      const user = await prisma.user.create({
        data: generateUserEntity('test@test.com', 'account_test'),
      });
      const feed = await prisma.feed.create({
        data: generateFeedEntity(user.id, null),
      });
      const feedComment = await prisma.feedComment.create({
        data: generateFeedCommentEntity(feed.id, user.id),
      });

      const dto: CreateReportRequest = {
        reason: '욕설',
        reportedId: feedComment.id,
        type: 'FEED_COMMENT',
      };

      const response = await request(app.getHttpServer())
        .post('/reports')
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;
      const report = await prisma.report.findMany();

      expect(status).toEqual(201);
      expect(report.length).toEqual(1);
    });
  });
});
