/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import { CreateGatheringFeedRequest, Order } from 'src/presentation/dto';
import {
  generateFeedCommentEntity,
  generateFeedEntity,
  generateFeedImageEntity,
  generateFriendEntity,
  generateFriendFeedVisibilityEntity,
  generateGatheringEntity,
  generateGatheringParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { UpdateFeedRequest } from 'src/presentation/dto/feed/request/update-feed.request';
import { Feed, Friend, User } from '@prisma/client';
import { CreateFriendFeedRequest } from 'src/presentation/dto/feed/request/create-friend-feed.request';
import { ResponseResult } from 'test/helpers/types';
import { FeedListResponse } from 'src/presentation/dto/feed/response/feed-list.response';

describe('FeedsController (e2e)', () => {
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
    await prisma.blockedFeed.deleteMany();
    await prisma.feedComment.deleteMany();
    await prisma.friendFeedVisibility.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.feedImage.deleteMany();
    await prisma.feed.deleteMany();
    await prisma.gatheringParticipation.deleteMany();
    await prisma.gathering.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /feeds/gatherings - 모임 피드 작성', () => {
    it('모임 피드 작성 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const gathering = await prisma.gathering.create({
        data: generateGatheringEntity(loginedUser!.id),
      });
      await prisma.gathering.update({
        data: { endedAt: new Date() },
        where: { id: gathering.id },
      });
      const dto: CreateGatheringFeedRequest = {
        content:
          '안녕하세요 오늘은 두리집을 청소해볼게요, 너무 더러워서 청소가 힘드네요~',
        imageUrls: [
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
        ],
        gatheringId: gathering.id,
      };

      const response = await request(app.getHttpServer())
        .post('/feeds/gatherings')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(201);
    });
  });

  describe('(POST) /feeds/friends - 일반, 친구 피드 작성', () => {
    it('일반, 친구 피드 작성 정상 동작', async () => {
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
          data: generateUserEntity(`test${i}test.com`, `account${i}_id`),
        });
        users.push(user);
      }
      for (let i = 0; i < 10; i++) {
        const friendRelation = await prisma.friend.create({
          data: generateFriendEntity(loginedUser!.id, users[i].id, 'ACCEPTED'),
        });
        friendRelations.push(friendRelation);
      }

      const dto: CreateFriendFeedRequest = {
        content:
          '안녕하세요 오늘은 두리집을 청소해볼게요, 너무 더러워서 청소가 힘드네요~',
        imageUrls: [
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
          'https://image.com',
        ],
        friendIds: users.map((user) => user.id),
      };

      const response = await request(app.getHttpServer())
        .post('/feeds/friends')
        .send(dto)
        .set('Authorization', accessToken);
      const { status, body } = response;

      expect(status).toEqual(201);
    });
  });

  describe('(PATCH) /feeds/{feedId} - 피드 내용 수정', () => {
    it('피드 수정 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const feed = await prisma.feed.create({
        data: generateFeedEntity(loginedUser!.id),
      });

      const dto: UpdateFeedRequest = {
        content: '이것은 수정된 내용입니다 안녕하세요오오',
      };

      const response = await request(app.getHttpServer())
        .patch(`/feeds/${feed.id}`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(204);
    });
  });

  describe('(GET) /feeds - 피드 목록 조회', () => {
    it('피드 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      // 회원 생성
      const users = Array.from({ length: 10 }, (_, i) =>
        generateUserEntity(`test${i}.test.com`, `account${i}_id`, `김민수${i}`),
      );
      await prisma.user.createMany({ data: users });

      // 내가 만든 그룹, 아닌 그룹 하나씩 생성
      const ownGathering = generateGatheringEntity(
        loginedUser!.id,
        new Date(),
        '내가 만든 모임',
      );
      const notOwngathering = generateGatheringEntity(
        users[0].id,
        new Date(),
        '누군가가 만든 모임',
      );
      await prisma.gathering.createMany({
        data: [ownGathering, notOwngathering],
      });

      // 내가 만든 그룹, 아닌 그룹에 멤버 4명씩 추가
      const ownGatheringParticipations = Array.from({ length: 4 }, (_, i) =>
        generateGatheringParticipationEntity(ownGathering.id, users[i].id),
      );
      const gatheringParticipations = Array.from({ length: 4 }, (_, i) =>
        generateGatheringParticipationEntity(
          notOwngathering.id,
          users[i + 4].id,
        ),
      );
      // 내가 만든 그룹이 아닌 그룹에 나도 참가
      const loginedUserParticipation = generateGatheringParticipationEntity(
        notOwngathering.id,
        loginedUser!.id,
        'ACCEPTED',
      );
      await prisma.gatheringParticipation.createMany({
        data: [
          ...ownGatheringParticipations,
          ...gatheringParticipations,
          loginedUserParticipation,
        ],
      });

      const feeds: Feed[] = [];
      // 친구가 작성한 일반 피드 생성.
      for (let i = 0; i < 5; i++) {
        const feedEntity = generateFeedEntity(
          users[i].id,
          null,
          new Date(`2024-${12}-0${9 - i}T12:00:00.000Z`),
          `일반 피드${i}`,
        );
        const feedImages = Array.from({ length: 1 }, (_, i) =>
          generateFeedImageEntity(i, `https://cdn.lighty.today/image${i}.jpg`),
        );
        const feed = await prisma.feed.create({
          data: {
            ...feedEntity,
            images: {
              createMany: {
                data: feedImages,
              },
            },
          },
        });
        feeds.push(feed);
      }
      // 내가 생성한 모임에 친구가 작성한 피드 생성.
      for (let i = 0; i < 5; i++) {
        const feedEntity = generateFeedEntity(
          users[i].id,
          ownGathering.id,
          new Date(`2024-0${8}-0${9 - i}T12:00:00.000Z`),
          `내가 만든 모임에 친구가 쓴 피드${i}`,
        );
        const feedImages = Array.from({ length: 2 }, (_, i) =>
          generateFeedImageEntity(i, `https://cdn.lighty.today/image${i}.jpg`),
        );
        const feed = await prisma.feed.create({
          data: {
            ...feedEntity,
            images: {
              createMany: {
                data: feedImages,
              },
            },
          },
        });
        feeds.push(feed);
      }
      // 참가 중인 모임에 다른 회원이 작성한 피드 생성.
      for (let i = 0; i < 5; i++) {
        const feedEntity = generateFeedEntity(
          users[i].id,
          notOwngathering.id,
          new Date(`2024-0${1}-0${9 - i}T12:00:00.000Z`),
          `내가 참여 중인 모임에 다른 회원이 쓴 피드${i}`,
        );
        const feedImages = Array.from({ length: 5 }, (_, i) =>
          generateFeedImageEntity(i, `https://cdn.lighty.today/image${i}.jpg`),
        );
        const feed = await prisma.feed.create({
          data: {
            ...feedEntity,
            images: {
              createMany: {
                data: feedImages,
              },
            },
          },
        });
        feeds.push(feed);
      }
      // 참가 중인 모임에 내가 작성한 피드 생성.
      for (let i = 0; i < 5; i++) {
        const feedEntity = generateFeedEntity(
          loginedUser!.id,
          notOwngathering.id,
          new Date(`2024-0${1}-0${9 - i}T12:00:00.000Z`),
          `내가 참여 중인 모임에 내가 쓴 피드${i}`,
        );
        const feedImages = Array.from({ length: 5 }, (_, i) =>
          generateFeedImageEntity(i, `https://cdn.lighty.today/image${i}.jpg`),
        );
        const feed = await prisma.feed.create({
          data: {
            ...feedEntity,
            images: {
              createMany: {
                data: feedImages,
              },
            },
          },
        });
        feeds.push(feed);
      }

      // 일반 피드 공개 범위 목록에 나를 추가.
      const feedVisibilities = Array.from({ length: 5 }, (_, i) =>
        generateFriendFeedVisibilityEntity(feeds[i].id, loginedUser!.id),
      );
      // 일반 피드에 함께하는 다른 회원 추가
      const otherUserFeedVisibilities = Array.from({ length: 10 }, (_, i) =>
        generateFriendFeedVisibilityEntity(feeds[i % 5].id, users[i].id),
      );
      await prisma.friendFeedVisibility.createMany({
        data: [...feedVisibilities, ...otherUserFeedVisibilities],
      });

      // 댓글 추가.
      for (let i = 0; i < 7; i++) {
        await prisma.feedComment.create({
          data: generateFeedCommentEntity(feeds[0].id, loginedUser!.id),
        });
      }
      for (let i = 0; i < 8; i++) {
        await prisma.feedComment.create({
          data: generateFeedCommentEntity(feeds[1].id, loginedUser!.id),
        });
      }
      for (let i = 0; i < 12; i++) {
        await prisma.feedComment.create({
          data: generateFeedCommentEntity(feeds[12].id, loginedUser!.id),
        });
      }
      for (let i = 0; i < 13; i++) {
        await prisma.feedComment.create({
          data: generateFeedCommentEntity(feeds[13].id, loginedUser!.id),
        });
      }
      for (let i = 0; i < 14; i++) {
        await prisma.feedComment.create({
          data: generateFeedCommentEntity(feeds[14].id, loginedUser!.id),
        });
      }

      // 숨김 피드 추가.
      const blockedFeed1Id = feeds[0].id;
      const blockedFeed2Id = feeds[10].id;
      await prisma.blockedFeed.create({
        data: {
          userId: loginedUser!.id,
          feedId: blockedFeed1Id,
          createdAt: new Date(),
        },
      });
      await prisma.blockedFeed.create({
        data: {
          userId: loginedUser!.id,
          feedId: blockedFeed2Id,
          createdAt: new Date(),
        },
      });
      const expectedFeeds = feeds
        .filter((_, i) => i < 15 && i !== 0 && i !== 10)
        .sort((a, b) => {
          if (a.createdAt > b.createdAt) return -1;
          if (a.createdAt < b.createdAt) return 1;

          return a.id.localeCompare(b.id);
        });

      const order: Order = 'DESC';
      const minDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2024-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: maxDate,
        id: 'f72cf60c-1988-4906-88a1-5e4ac04c34a4',
      };
      const limit = 15;

      const response = await request(app.getHttpServer())
        .get(
          `/feeds?order=${order}&minDate=${minDate}&maxDate=${maxDate}&cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}`,
        )
        .set('Authorization', accessToken);
      const myFeedsResponse = await request(app.getHttpServer())
        .get(
          `/feeds/my?order=${order}&minDate=${minDate}&maxDate=${maxDate}&cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}`,
        )
        .set('Authorization', accessToken);
      const blockedFeedsResponse = await request(app.getHttpServer())
        .get(`/feeds/blocked?cursor=${JSON.stringify(cursor)}&limit=${limit}`)
        .set('Authorization', accessToken);

      const {
        status: allFeedStatus,
        body: allFeedsBody,
      }: ResponseResult<FeedListResponse> = response;
      const {
        status: myFeedStaus,
        body: myFeedsBody,
      }: ResponseResult<FeedListResponse> = myFeedsResponse;
      const {
        status: blockedFeedStatus,
        body: blcokedFeedsBody,
      }: ResponseResult<FeedListResponse> = blockedFeedsResponse;

      const { feeds: allFeeds, nextCursor: allFeedCursor } = allFeedsBody;
      const { feeds: myFeeds, nextCursor: myFeedCursor } = myFeedsBody;
      const { feeds: blockedFeeds, nextCursor: blockedFeedCursor } =
        blcokedFeedsBody;

      // TODO 검증 로직 추가해야함
      expect(allFeedStatus).toEqual(200);
      expect(myFeedStaus).toEqual(200);
      expect(blockedFeedStatus).toEqual(200);
      expect(allFeeds.length).toEqual(13);
      expect(myFeeds.length).toEqual(5);
      expect(blockedFeeds.length).toEqual(2);
      allFeeds.forEach((feed, i) => {
        expect(feed.id).toEqual(expectedFeeds[i].id);
        if (feed.gathering) {
          expect(feed.withMembers.length).toEqual(4);
        }
        if (!feed.gathering) {
          expect(feed.withMembers.length).toEqual(2);
        }
      });
    });

    it('삭제된 댓글은 카운트에서 제외된다', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user = await prisma.user.create({
        data: generateUserEntity('user@test.com', 'accoundtest'),
      });

      const feed = await prisma.feed.create({
        data: generateFeedEntity(
          user.id,
          null,
          new Date('2024-11-01T00:00:00.000Z'),
        ),
      });
      const feedVisibility = await prisma.friendFeedVisibility.create({
        data: generateFriendFeedVisibilityEntity(feed.id, loginedUser!.id),
      });
      const comments = Array.from({ length: 5 }, (_, i) =>
        generateFeedCommentEntity(feed.id, loginedUser!.id),
      );
      await prisma.feedComment.createMany({ data: comments });
      await prisma.feedComment.update({
        data: { deletedAt: new Date() },
        where: {
          id: comments[0].id,
        },
      });

      const order: Order = 'DESC';
      const minDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2024-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: maxDate,
        id: 'f72cf60c-1988-4906-88a1-5e4ac04c34a4',
      };
      const limit = 1;

      const response = await request(app.getHttpServer())
        .get(
          `/feeds?order=${order}&minDate=${minDate}&maxDate=${maxDate}&cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FeedListResponse> = response;
      const { feeds } = body;

      expect(status).toEqual(200);
      expect(feeds[0].commentCount).toEqual(comments.length - 1);
    });

    it('특정 회원이 피드를 숨김 처리해도 다른 회원에게는 항상 해당 피드가 노출되어야 한다', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user = await prisma.user.create({
        data: generateUserEntity('user@test.com', 'accoundtest'),
      });
      const otherUser = await prisma.user.create({
        data: generateUserEntity('otheruser@test.com', 'othertest'),
      });

      const feed = await prisma.feed.create({
        data: generateFeedEntity(
          user.id,
          null,
          new Date('2024-11-01T00:00:00.000Z'),
        ),
      });
      const feedVisibility = await prisma.friendFeedVisibility.create({
        data: generateFriendFeedVisibilityEntity(feed.id, loginedUser!.id),
      });
      const otherUserFeedBlock = await prisma.blockedFeed.create({
        data: { feedId: feed.id, userId: otherUser.id, createdAt: new Date() },
      });
      const comments = Array.from({ length: 5 }, (_, i) =>
        generateFeedCommentEntity(feed.id, loginedUser!.id),
      );
      await prisma.feedComment.createMany({ data: comments });
      await prisma.feedComment.update({
        data: { deletedAt: new Date() },
        where: {
          id: comments[0].id,
        },
      });

      const order: Order = 'DESC';
      const minDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const maxDate = new Date('2024-12-31T23:59:59.000Z').toISOString();
      const cursor = {
        createdAt: maxDate,
        id: 'f72cf60c-1988-4906-88a1-5e4ac04c34a4',
      };
      const limit = 1;

      const response = await request(app.getHttpServer())
        .get(
          `/feeds?order=${order}&minDate=${minDate}&maxDate=${maxDate}&cursor=${JSON.stringify(
            cursor,
          )}&limit=${limit}`,
        )
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FeedListResponse> = response;
      const { feeds } = body;

      expect(status).toEqual(200);
      expect(feeds.length).toEqual(1);
    });
  });

  describe('(DELETE) /feeds/{id} - 피드 삭제', () => {
    it('피드 삭제 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });

      const feed = await prisma.feed.create({
        data: generateFeedEntity(loginedUser!.id, null),
      });
      const comments = Array.from({ length: 5 }, (_, i) =>
        generateFeedCommentEntity(feed.id, loginedUser!.id),
      );
      await prisma.feedComment.createMany({ data: comments });

      const response = await request(app.getHttpServer())
        .delete(`/feeds/${feed.id}`)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(204);
    });
  });
});
