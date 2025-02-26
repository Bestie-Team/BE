import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { DateIdPaginationInput } from 'src/shared/types';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';
import { NotificationsWriter } from 'src/domain/components/notification/notifications-writer';
import { NotificationsReader } from 'src/domain/components/notification/notifications-reader';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
    private readonly notificationsWriter: NotificationsWriter,
    private readonly notificationsReader: NotificationsReader,
  ) {}

  async createV2(
    input: NotificationPrototype & {
      token: string | null;
      serviceNotificationConsent: boolean;
    },
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const stdDate = new Date();
    const notification = NotificationEntity.create(input, v4, stdDate);
    this.notificationsWriter.create(notification);

    if (input.token && input.serviceNotificationConsent) {
      this.eventPublisher.publish('notify', {
        body: input.message,
        title: input.title,
        token: input.token,
      });
    }
  }

  async createNotifications(prototypes: NotificationPrototype[]) {
    const stdDate = new Date();
    const notifications = prototypes.map((proto) =>
      NotificationEntity.create(
        {
          message: proto.message,
          relatedId: proto.relatedId,
          title: proto.title,
          type: proto.type,
          userId: proto.userId,
        },
        v4,
        stdDate,
      ),
    );
    await this.notificationsWriter.createMany(notifications);
  }

  async getAll(userId: string, paginationInput: DateIdPaginationInput) {
    return await this.notificationsReader.read(userId, paginationInput);
  }

  async readAll(userId: string) {
    await this.notificationsReader.readAll(userId);
  }

  async delete(id: string) {
    await this.notificationsReader.readAll(id);
  }

  async deleteAll(userId: string) {
    await this.notificationsReader.readAll(userId);
  }
}
