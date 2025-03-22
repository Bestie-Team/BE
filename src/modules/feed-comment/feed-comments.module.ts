import { Module } from '@nestjs/common';
import { FeedCommentCreationUseCase } from 'src/application/use-cases/feed-comment/feed-comment.use-case';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentsService } from 'src/domain/services/feed-comments/feed-comments.service';
import { FeedCommentPrismaRepository } from 'src/infrastructure/repositories/feed-comment/feed-comment-prisma.repository';
import { FeedCommentsComponentModule } from 'src/modules/feed-comment/feed-comments-component.module';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { ReportsModule } from 'src/modules/report/reports.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { FeedCommentController } from 'src/presentation/controllers/feed-comment/feed-comment.controller';

@Module({
  imports: [
    UsersComponentModule,
    NotificationsModule,
    FeedsComponentModule,
    ReportsModule,
    FeedCommentsComponentModule,
  ],
  controllers: [FeedCommentController],
  providers: [
    FeedCommentCreationUseCase,
    FeedCommentsService,
    { provide: FeedCommentRepository, useClass: FeedCommentPrismaRepository },
  ],
})
export class FeedCommentsModule {}
