import { Module } from '@nestjs/common';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { EventModule } from 'src/infrastructure/event/event.module';
import { FeedCommentsComponentModule } from 'src/modules/feed-comment/feed-comments-component.module';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { NotificationsComponentModule } from 'src/modules/notification/notifications-component.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';

@Module({
  imports: [
    EventModule,
    NotificationsComponentModule,
    UsersComponentModule,
    FeedCommentsComponentModule,
    FeedsComponentModule,
  ],
  providers: [NotificationsManager],
  exports: [NotificationsManager],
})
export class NotificationsManagerModule {}
