import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { FeedCommentsReader } from 'src/domain/components/feed-comment/feed-comment-reader';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { FeedCommentsComponentModule } from 'src/modules/feed-comment/feed-comments-component.module';
import {
  generateBlockedComment,
  generateFeedCommentEntity,
  generateFeedEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('FeedCommentsReader', () => {
  let feedCommentsReader: FeedCommentsReader;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FeedCommentsComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    }).compile();

    feedCommentsReader = app.get<FeedCommentsReader>(FeedCommentsReader);
    db = app.get<PrismaService>(PrismaService);
    db.onModuleInit();
  });

  afterEach(async () => {
    await db.blockedFeedComment.deleteMany();
    await db.feedComment.deleteMany();
    await db.feed.deleteMany();
    await db.user.deleteMany();
  });

  describe('피드 댓글 조회', () => {
    const user = generateUserEntity('test@test.com', 'test_id');
    const commentWriter = generateUserEntity('writer@test.com', 'writer_id');
    const feed = generateFeedEntity(commentWriter.id);

    const comments = Array.from({ length: 10 }, (_, i) =>
      generateFeedCommentEntity(feed.id, commentWriter.id, null, `hi ${i}`),
    );

    beforeEach(async () => {
      await db.user.createMany({ data: [user, commentWriter] });
      await db.feed.create({ data: feed });
      await db.feedComment.createMany({ data: comments });
    });

    it('피드 댓글 조회 정상 동작.', async () => {
      const result = await feedCommentsReader.readAll(feed.id, user.id);

      expect(result.length).toBe(comments.length);
    });

    it('숨김 처리된 댓글은 조회되지 않는다.', async () => {
      const blockedComment1 = generateBlockedComment(comments[0].id, user.id);
      const blockedComment2 = generateBlockedComment(comments[1].id, user.id);
      await db.blockedFeedComment.createMany({
        data: [blockedComment1, blockedComment2],
      });

      const result = await feedCommentsReader.readAll(feed.id, user.id);

      expect(result.length).toBe(comments.length - 2);
      result.forEach((comment) => {
        expect(comment.id).not.toEqual(comments[0].id);
        expect(comment.id).not.toEqual(comments[1].id);
      });
    });

    it('탈퇴한 회원의 댓글은 조회되지 않는다.', async () => {
      await db.user.update({
        data: { deletedAt: new Date() },
        where: { id: commentWriter.id },
      });

      const result = await feedCommentsReader.readAll(feed.id, user.id);

      expect(result.length).toBe(0);
    });
  });
});
