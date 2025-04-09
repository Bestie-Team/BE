import { Module } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { EventModule } from 'src/infrastructure/event/event.module';
import { NotificationsPrismaRepository } from 'src/infrastructure/repositories/notification/notifications-prisma.repository';
import { NotificationsController } from 'src/presentation/controllers/notification/notifications.controller';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { NotificationsComponentModule } from 'src/modules/notification/notifications-component.module';
import { FeedCommentsComponentModule } from 'src/modules/feed-comment/feed-comments-component.module';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';

@Module({
  imports: [
    EventModule,
    UsersComponentModule,
    NotificationsComponentModule,
    // TODO use case 제거하면 다 뺴야함
    FeedCommentsComponentModule,
    FeedsComponentModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsManager,
    {
      provide: NotificationsRepository,
      useClass: NotificationsPrismaRepository,
    },
  ],
  exports: [NotificationsService, NotificationsManager],
})
export class NotificationsModule {}
