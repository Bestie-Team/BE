import { Module } from '@nestjs/common';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentsService } from 'src/domain/services/feed-comment/feed-comments.service';
import { FeedCommentPrismaRepository } from 'src/infrastructure/repositories/feed-comment/feed-comment-prisma.repository';
import { FeedCommentController } from 'src/presentation/controllers/feed-comment/feed-comment.controller';

@Module({
  controllers: [FeedCommentController],
  providers: [
    FeedCommentsService,
    { provide: FeedCommentRepository, useClass: FeedCommentPrismaRepository },
  ],
})
export class FeedCommentsModule {}
