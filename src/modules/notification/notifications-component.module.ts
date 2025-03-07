import { Module } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationsPrismaRepository } from 'src/infrastructure/repositories/notification/notifications-prisma.repository';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { NotificationsReader } from 'src/domain/components/notification/notifications-reader';
import { NotificationsWriter } from 'src/domain/components/notification/notifications-writer';

@Module({
  imports: [UsersComponentModule],
  providers: [
    NotificationsReader,
    NotificationsWriter,
    {
      provide: NotificationsRepository,
      useClass: NotificationsPrismaRepository,
    },
  ],
  exports: [NotificationsReader, NotificationsWriter],
})
export class NotificationsComponentModule {}
