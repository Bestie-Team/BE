import { Module } from '@nestjs/common';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { EventModule } from 'src/infrastructure/event/event.module';
import { NotificationsComponentModule } from 'src/modules/notification/notifications-component.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';

@Module({
  imports: [EventModule, NotificationsComponentModule, UsersComponentModule],
  providers: [NotificationsManager],
  exports: [NotificationsManager],
})
export class NotificationsManagerModule {}
