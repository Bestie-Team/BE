import { Module } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { EventModule } from 'src/infrastructure/event/event.module';
import { NotificationsPrismaRepository } from 'src/infrastructure/repositories/notification/notifications-prisma.repository';
import { NotificationsController } from 'src/presentation/controllers/notification/notifications.controller';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';

@Module({
  imports: [EventModule, UsersComponentModule],
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
