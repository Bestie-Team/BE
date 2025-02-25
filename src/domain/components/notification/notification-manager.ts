import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { APP_NAME } from 'src/common/constant';

@Injectable()
export class NotificationsManager {
  private readonly logger = new Logger('NotificationsManager');

  constructor(
    @Inject(NotificationsRepository)
    private readonly notificationRepository: NotificationsRepository,
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
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
    this.notificationRepository.save(notification);

    if (input.token && input.serviceNotificationConsent) {
      this.eventPublisher.publish('notify', {
        body: input.message,
        title: input.title,
        token: input.token,
      });
    }
  }

  async sendGatheringCreation(senderId: string, receiverIds: string[]) {
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
