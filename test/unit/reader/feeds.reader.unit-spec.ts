import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { FeedPaginationInput } from 'src/domain/types/feed.types';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import {
  generateFeedEntity,
  generateFriendFeedVisibilityEntity,
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('FeedsReader', () => {
  let feedsReader: FeedsReader;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FeedsComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    }).compile();

    feedsReader = app.get<FeedsReader>(FeedsReader);
    db = app.get<PrismaService>(PrismaService);
    db.onModuleInit();
  });

  afterEach(async () => {
    await db.friendFeedVisibility.deleteMany();
    await db.gatheringParticipation.deleteMany();
    await db.gathering.deleteMany();
    await db.feed.deleteMany();
    await db.user.deleteMany();
  });

  describe('전체 피드 조회', () => {
    const me = generateUserEntity('me@test.com', 'mememem');
    const gatheringMemberUsers = Array.from({ length: 3 }, (_, i) =>
      generateUserEntity(`member${i}@test.com`, `member${i}_id`),
    );
    const friendUsers = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`friend${i}@test.com`, `friend${i}_id`),
    );

    const gathering = generateGatheringEntity(gatheringMemberUsers[0].id);
    const otherGathering = generateGatheringEntity(gatheringMemberUsers[1].id);
    const ownGathering = generateGatheringEntity(me.id);

    const myParticipation1 = generateGatheringParticipationEntity(
      ownGathering.id,
      me.id,
      'ACCEPTED',
    );
    const myParticipation2 = generateGatheringParticipationEntity(
      gathering.id,
      me.id,
      'ACCEPTED',
    );

    const gatheringParticipations = Array.from({ length: 3 }, (_, i) =>
      generateGatheringParticipationEntity(
        gathering.id,
        gatheringMemberUsers[i].id,
        'ACCEPTED',
      ),
    );
    const ownGatheringParticipations = Array.from({ length: 3 }, (_, i) =>
      generateGatheringParticipationEntity(
        ownGathering.id,
        gatheringMemberUsers[i].id,
        'ACCEPTED',
      ),
    );
    const otherGatheringParticipations = Array.from({ length: 3 }, (_, i) =>
      generateGatheringParticipationEntity(
        otherGathering.id,
        gatheringMemberUsers[i].id,
        'ACCEPTED',
      ),
    );

    const gatheringFeeds = gatheringMemberUsers.map((user) =>
      generateFeedEntity(user.id, gathering.id),
    );
    const ownGatheringFeeds = gatheringMemberUsers.map((user) =>
      generateFeedEntity(user.id, ownGathering.id),
    );
    const otherGatheringFeeds = gatheringMemberUsers.map((user) =>
      generateFeedEntity(user.id, otherGathering.id),
    );

    const friendFeeds = friendUsers.map((user) => generateFeedEntity(user.id));
    const friendFeedVisibilitiesWithMe = friendFeeds.map((feed) =>
      generateFriendFeedVisibilityEntity(feed.id, me.id),
    );
    const allFriendFeedVisibilities = friendUsers.flatMap((user) =>
      friendFeeds
        .filter((feed) => feed.writerId !== user.id)
        .map((feed) => generateFriendFeedVisibilityEntity(feed.id, user.id)),
    );

    beforeEach(async () => {
      await db.user.createMany({
        data: [me, ...gatheringMemberUsers, ...friendUsers],
      });
      await db.gathering.createMany({
        data: [gathering, ownGathering, otherGathering],
      });
      await db.gatheringParticipation.createMany({
        data: [
          myParticipation1,
          myParticipation2,
          ...gatheringParticipations,
          ...ownGatheringParticipations,
          ...otherGatheringParticipations,
        ],
      });
      await db.feed.createMany({
        data: [
          ...ownGatheringFeeds,
          ...gatheringFeeds,
          ...otherGatheringFeeds,
          ...friendFeeds,
        ],
      });
      await db.friendFeedVisibility.createMany({
        data: [...friendFeedVisibilitiesWithMe, ...allFriendFeedVisibilities],
      });
    });

    it('자신이 참여한 모임의 피드와 공개 범위에 속한 모든 피드가 조회된다.', async () => {
      const paginationInput: FeedPaginationInput = {
        cursor: {
          id: '0890d33b-543b-4fc7-88dc-c5eb4acf57eb',
          createdAt: new Date().toISOString(),
        },
        limit: 12,
        maxDate: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        minDate: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        order: 'DESC',
      };

      const result = await feedsReader.readAll(me.id, paginationInput);

      const { feeds, nextCursor } = result;
      const expectedFeeds = [
        ...gatheringFeeds,
        ...ownGatheringFeeds,
        ...friendFeeds,
      ].sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        if (a.createdAt > b.createdAt) return -1;
        return a.id.localeCompare(b.id);
      });

      expect(feeds.length).toEqual(11);
      expect(nextCursor).toBeNull();
      expectedFeeds.forEach((expectedFeed, i) => {
        expect(feeds[i].id).toEqual(expectedFeed.id);
        expect(feeds[i].content).toEqual(expectedFeed.content);
      });
    });

    it('모임 피드라면 작성자를 제외한 다른 모임원이 함께하는 회원으로 조회된다.', async () => {
      const paginationInput: FeedPaginationInput = {
        cursor: {
          id: '0890d33b-543b-4fc7-88dc-c5eb4acf57eb',
          createdAt: new Date().toISOString(),
        },
        limit: 12,
        maxDate: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        minDate: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        order: 'DESC',
      };

      const result = await feedsReader.readAll(me.id, paginationInput);
      const { feeds } = result;

      feeds.forEach((feed) => {
        if (feed.gathering) {
          expect(feed.withMembers.length).toEqual(gatheringMemberUsers.length);
          feed.withMembers.forEach((member) => {
            expect(feed.writer.id).not.toEqual(member.id);
          });
        }
      });
    });

    it('친구 공개 피드라면 작성자를 제외한 공개 범위에 속한 친구들이 함께하는 회원으로 조회된다.', async () => {
      const paginationInput: FeedPaginationInput = {
        cursor: {
          id: '0890d33b-543b-4fc7-88dc-c5eb4acf57eb',
          createdAt: new Date().toISOString(),
        },
        limit: 12,
        maxDate: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        minDate: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        order: 'DESC',
      };

      const result = await feedsReader.readAll(me.id, paginationInput);
      const { feeds } = result;

      feeds.forEach((feed) => {
        if (!feed.gathering) {
          expect(feed.withMembers.length).toEqual(5);
          feed.withMembers.forEach((member) => {
            expect(feed.writer.id).not.toEqual(member.id);
          });
        }
      });
    });

    it('내가 작성한 피드도 조회된다.', async () => {
      const myGatheringFeeds = [gathering, ownGathering].map((gathering) =>
        generateFeedEntity(me.id, gathering.id),
      );
      const myFriendFeed = generateFeedEntity(me.id);
      await db.feed.createMany({ data: [...myGatheringFeeds, myFriendFeed] });

      const paginationInput: FeedPaginationInput = {
        cursor: {
          id: '0890d33b-543b-4fc7-88dc-c5eb4acf57eb',
          createdAt: new Date().toISOString(),
        },
        limit: 15,
        maxDate: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        minDate: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        order: 'DESC',
      };

      const result = await feedsReader.readAll(me.id, paginationInput);
      const { feeds, nextCursor } = result;

      expect(feeds.length).toEqual(14);
      expect(nextCursor).toEqual(null);
    });
  });
});
