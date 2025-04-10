import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { clsOptions } from 'src/configs/cls/cls-options';
import {
  DUPLICATE_GATHERING_FEED,
  FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
  FORBIDDEN_MESSAGE,
  IS_NOT_DONE_GATHERING_MESSAGE,
  NOT_FOUND_GATHERING_MESSAGE,
} from 'src/domain/error/messages';
import { FeedsService } from 'src/domain/services/feed/feeds.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BlockedFeedsModule } from 'src/modules/feed/blocked-feeds.module';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { FeedsModule } from 'src/modules/feed/feeds.module';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';
import {
  generateFeedEntity,
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('FeedsService', () => {
  let feedsService: FeedsService;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FeedsModule,
        BlockedFeedsModule,
        FeedsComponentModule,
        FriendsCheckerModule,
        GatheringsComponentModule,
        GatheringParticipationModules,
        EventEmitterModule.forRoot(),
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
      providers: [],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: () => true })
      .compile();

    feedsService = app.get<FeedsService>(FeedsService);
    db = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  afterEach(async () => {
    await db.feed.deleteMany();
    await db.gatheringParticipation.deleteMany();
    await db.gathering.deleteMany();
    await db.user.deleteMany();
  });

  describe('모임 피드 생성', () => {
    const users = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `account${i}_id`),
    );
    const otherUser = generateUserEntity('other@test.com', 'other_id');
    const gathering = generateGatheringEntity(users[0].id);
    const gatheringParticipations = Array.from({ length: 5 }, (_, i) =>
      generateGatheringParticipationEntity(
        gathering.id,
        users[i].id,
        'ACCEPTED',
      ),
    );
    const otherUserFeed = generateFeedEntity(users[2].id, gathering.id);

    const writer = users[1];
    const images = [
      'https://image1.com',
      'https://image2.com',
      'https://image3.com',
    ];

    beforeEach(async () => {
      await db.user.createMany({ data: [...users, otherUser] });
      await db.gathering.create({ data: gathering });
      await db.feed.create({ data: otherUserFeed });
      await db.gatheringParticipation.createMany({
        data: gatheringParticipations,
      });
    });

    it('존재하지 않는 모임일 경우 예외가 발생한다', async () => {
      await db.gathering.update({
        data: { endedAt: new Date() },
        where: { id: gathering.id },
      });

      const nonExistGatheringId = '0890d33b-543b-4fc7-88dc-c5eb4acf57eb';

      const { id: writerId } = writer;
      const input = {
        content: 'content',
        gatheringId: nonExistGatheringId,
        writerId,
      };

      await expect(async () =>
        feedsService.createGatheringFeed(input, images),
      ).rejects.toThrow(new NotFoundException(NOT_FOUND_GATHERING_MESSAGE));
    });

    it('모임에 이미 피드를 작성한 경우 예외가 발생한다', async () => {
      await db.gathering.update({
        data: { endedAt: new Date() },
        where: { id: gathering.id },
      });

      const { id: writerId } = writer;
      const feed = generateFeedEntity(writerId, gathering.id);
      await db.feed.create({ data: feed });

      const input = {
        content: 'content',
        gatheringId: gathering.id,
        writerId,
      };

      await expect(async () =>
        feedsService.createGatheringFeed(input, images),
      ).rejects.toThrow(new ConflictException(DUPLICATE_GATHERING_FEED));
    });

    it('완료되지 않은 모임에 피드를 작성하려는 경우 예외가 발생한다', async () => {
      const { id: writerId } = writer;
      const feed = generateFeedEntity(writerId, gathering.id);
      await db.feed.create({ data: feed });

      const input = {
        content: 'content',
        gatheringId: gathering.id,
        writerId,
      };

      await expect(async () =>
        feedsService.createGatheringFeed(input, images),
      ).rejects.toThrow(
        new UnprocessableEntityException(IS_NOT_DONE_GATHERING_MESSAGE),
      );
    });

    it('완료된지 30일이 지난 모임에 피드를 작성하려는 경우 예외가 발생한다', async () => {
      const endedAt = new Date(2025, 1, 1);
      const today = new Date(2025, 1, 31);

      await db.gathering.update({
        data: { endedAt },
        where: { id: gathering.id },
      });

      const { id: writerId } = writer;
      const feed = generateFeedEntity(writerId, gathering.id);
      await db.feed.create({ data: feed });

      const input = {
        content: 'content',
        gatheringId: gathering.id,
        writerId,
      };

      await expect(async () =>
        feedsService.createGatheringFeed(input, images, today),
      ).rejects.toThrow(
        new UnprocessableEntityException(FEED_CREATION_PERIOD_EXCEEDED_MESSAGE),
      );
    });

    it('모임원이 아닌 회원이 피드를 작성하려는 경우 예외가 발생한다', async () => {
      await db.gathering.update({
        data: { endedAt: new Date() },
        where: { id: gathering.id },
      });

      const writerId = otherUser.id;
      const input = {
        content: 'content',
        gatheringId: gathering.id,
        writerId,
      };

      await expect(async () =>
        feedsService.createGatheringFeed(input, images),
      ).rejects.toThrow(new ForbiddenException(FORBIDDEN_MESSAGE));
    });
  });
});
