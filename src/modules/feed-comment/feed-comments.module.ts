import { Module } from '@nestjs/common';
import { FeedCommentCreationUseCase } from 'src/application/use-cases/feed-comment/feed-comment.use-case';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentsService } from 'src/domain/services/feed-comment/feed-comments.service';
import { FeedCommentPrismaRepository } from 'src/infrastructure/repositories/feed-comment/feed-comment-prisma.repository';
import { FeedsModule } from 'src/modules/feed/feeds.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { FeedCommentController } from 'src/presentation/controllers/feed-comment/feed-comment.controller';

@Module({
  imports: [UsersModule, NotificationsModule, FeedsModule],
  controllers: [FeedCommentController],
  providers: [
    FeedCommentCreationUseCase,
    FeedCommentsService,
    { provide: FeedCommentRepository, useClass: FeedCommentPrismaRepository },
  ],
})
export class FeedCommentsModule {}
