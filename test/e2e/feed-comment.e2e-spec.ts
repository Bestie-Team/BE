/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FeedComment } from '@prisma/client';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { login } from 'test/helpers/login';
import {
  generateFeedCommentEntity,
  generateFeedEntity,
  generateUserEntity,
} from 'test/helpers/generators';
import { ResponseResult } from 'test/helpers/types';
import { CreateFeedCommentRequest } from 'src/presentation/dto/comment/request/create-feed-comment.request';
import { FeedCommentResponse } from 'src/presentation/dto/comment/response/feed-comment-list.response';
import { ListenersModule } from 'src/infrastructure/event/listeners/listeners.module';
import { EmptyModule } from 'test/helpers/empty.module';

describe('FeedCommentController (e2e)', () => {
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

  afterAll(() => {
    app.close();
  });

  afterEach(async () => {
    await prisma.feedComment.deleteMany();
    await prisma.feed.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('(POST) /feed-comments - 피드 댓글 작성', () => {
    it('댓글 작성 정상 동작', async () => {
      const { accessToken } = await login(app);

      const user = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 4
      });
      const feed = await prisma.feed.create({
        data: generateFeedEntity(user.id, null),
      });

      const dto: CreateFeedCommentRequest = {
        feedId: feed.id,
        content: '난 댓글이야',
      };

      // when
      const response = await request(app.getHttpServer())
        .post(`/feed-comments`)
        .send(dto)
        .set('Authorization', accessToken);
      const { status } = response;

      expect(status).toEqual(201);
    });
  });

  describe('(GET) /feed-comments - 피드 댓글 목록 조회', () => {
    it('댓글 목록 조회 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 4
      });
      const feed = await prisma.feed.create({
        data: generateFeedEntity(user.id, null),
      });
      const comments: FeedComment[] = [];
      for (let i = 0; i < 10; i++) {
        const comment = await prisma.feedComment.create({
          data: generateFeedCommentEntity(
            feed.id,
            loginedUser!.id,
            `난 댓글${i}`,
            new Date(
              `2025-01-${String(30 - i).padStart(2, '0')}T00:00:00.000Z`,
            ),
          ),
        });
        comments.push(comment);
      }

      // when
      const response = await request(app.getHttpServer())
        .get(`/feed-comments?feedId=${feed.id}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FeedCommentResponse[]> = response;

      expect(status).toEqual(200);
      body.forEach((comment, i) => {
        expect(comment.id).toEqual(comments[i].id);
        expect(comment.content).toEqual(comments[i].content);
        expect(comment.createdAt).toEqual(comments[i].createdAt.toISOString());
        expect(comment.writer.id).toEqual(loginedUser!.id);
      });
    });
  });

  describe('(DELETE) /feed-comments/{id} - 피드 댓글 삭제', () => {
    it('댓글 삭제 정상 동작', async () => {
      const { accessToken, accountId } = await login(app);

      const loginedUser = await prisma.user.findFirst({
        where: {
          accountId,
        },
      });
      const user = await prisma.user.create({
        data: generateUserEntity('test1@test.com', 'lighty_1', '김민수'), // 4
      });
      const feed = await prisma.feed.create({
        data: generateFeedEntity(user.id, null),
      });
      const comment = await prisma.feedComment.create({
        data: generateFeedCommentEntity(feed.id, loginedUser!.id),
      });

      // when
      const response = await request(app.getHttpServer())
        .delete(`/feed-comments/${comment.id}`)
        .set('Authorization', accessToken);
      const { status, body }: ResponseResult<FeedCommentResponse[]> = response;

      expect(status).toEqual(204);
    });
  });
});
