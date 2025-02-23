import { Module } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { EventModule } from 'src/infrastructure/event/event.module';
import { NotificationsPrismaRepository } from 'src/infrastructure/repositories/notification/notifications-prisma.repository';
import { NotificationsController } from 'src/presentation/controllers/notification/notifications.controller';

@Module({
  imports: [EventModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NotificationsRepository,
      useClass: NotificationsPrismaRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
