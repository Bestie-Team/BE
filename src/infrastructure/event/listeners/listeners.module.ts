import { Module } from '@nestjs/common';
import { NotificationListener } from 'src/infrastructure/event/listeners/notification/notification.listener';

@Module({
  providers: [NotificationListener],
})
export class ListenersModule {}
