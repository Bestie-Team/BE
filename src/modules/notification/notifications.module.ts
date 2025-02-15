import { Module } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { NotificationsPrismaRepository } from 'src/infrastructure/repositories/notification/notifications-prisma.repository';
import { NotificationsController } from 'src/presentation/controllers/notification/notifications.controller';

@Module({
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
