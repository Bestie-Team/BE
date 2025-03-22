import { Module } from '@nestjs/common';
import { FeedCommentsReader } from 'src/domain/components/feed-comment/feed-comment-reader';
import { FeedCommentsWriter } from 'src/domain/components/feed-comment/feed-comments-writer';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentPrismaRepository } from 'src/infrastructure/repositories/feed-comment/feed-comment-prisma.repository';

@Module({
  providers: [
    FeedCommentsReader,
    FeedCommentsWriter,
    {
      provide: FeedCommentRepository,
      useClass: FeedCommentPrismaRepository,
    },
  ],
  exports: [FeedCommentsReader, FeedCommentsWriter],
})
export class FeedCommentsComponentModule {}
