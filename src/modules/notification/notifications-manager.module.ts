import { Module } from '@nestjs/common';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { EventModule } from 'src/infrastructure/event/event.module';
import { FeedCommentsComponentModule } from 'src/modules/feed-comment/feed-comments-component.module';
import { FeedsComponentModule } from 'src/modules/feed/feeds.component.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { NotificationsComponentModule } from 'src/modules/notification/notifications-component.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';

@Module({
  imports: [
    EventModule,
    NotificationsComponentModule,
    UsersComponentModule,
    FeedCommentsComponentModule,
    FeedsComponentModule,
    GatheringParticipationModules,
  ],
  providers: [NotificationsManager],
  exports: [NotificationsManager],
})
export class NotificationsManagerModule {}
