/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import { CreateGatheringFeedRequest } from 'src/presentation/dto';
import {
  generateFeedEntity,
  generateFriendEntity,
  generateGatheringEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { UpdateFeedRequest } from 'src/presentation/dto/feed/request/update-feed.request';
import { Friend, User } from '@prisma/client';
import { CreateFriendFeedRequest } from 'src/presentation/dto/feed/request/create-friend-feed.request';

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

  afterEach(async () => {
    await prisma.friendFeedVisibility.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.feedImage.deleteMany();
    await prisma.feed.deleteMany();
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
});
