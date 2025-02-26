import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { APP_NAME } from 'src/common/constant';
import { NotificationsWriter } from 'src/domain/components/notification/notifications-writer';

@Injectable()
export class NotificationsManager {
  private readonly logger = new Logger('NotificationsManager');

  constructor(
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
    private readonly notificationsWriter: NotificationsWriter,
    private readonly usersReader: UsersReader,
  ) {}

  async create(
    input: NotificationPrototype & {
      token: string | null;
      serviceNotificationConsent: boolean;
    },
  ) {
    const stdDate = new Date();
    const notification = NotificationEntity.create(input, v4, stdDate);
    this.notificationsWriter.create(notification);

    if (
      process.env.NODE_ENV !== 'test' &&
      input.token &&
      input.serviceNotificationConsent
    ) {
      this.eventPublisher.publish('notify', {
        body: input.message,
        title: input.title,
        token: input.token,
      });
    }
  }

  async sendGatheringCreation(senderId: string, receiverIds: string[]) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const sender = await this.usersReader.readOne(senderId);
    const receivers = await this.usersReader.readMulti(receiverIds);

    const notificationPromises = receivers.map(async (receiver) => {
      return this.create({
        message: `${sender.name}님이 약속 초대장을 보냈어요!`,
        type: 'GATHERING_INVITATION_RECEIVED',
        title: APP_NAME,
        userId: receiver.id,
        token: receiver.notificationToken,
        serviceNotificationConsent: receiver.serviceNotificationConsent,
        relatedId: null,
      }).catch((e: Error) =>
        this.logger.log({
          message: `알림 에러: ${e.message}`,
          stack: e.stack,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    Promise.all(notificationPromises);
  }
}
