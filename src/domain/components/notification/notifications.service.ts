import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { getNotificationCursor } from 'src/domain/helpers/get-cursor';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { DateIdPaginationInput } from 'src/shared/types';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(
    @Inject(NotificationsRepository)
    private readonly notificationRepository: NotificationsRepository,
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createV2(input: NotificationPrototype & { token: string }) {
    const stdDate = new Date();
    const notification = NotificationEntity.create(input, v4, stdDate);
    this.notificationRepository.save(notification);
    this.eventPublisher.publish('notify', {
      body: input.message,
      title: input.title,
      token: input.token,
    });
  }

  async create(prototype: NotificationPrototype) {
    const stdDate = new Date();
    const notification = NotificationEntity.create(prototype, v4, stdDate);
    await this.notificationRepository.save(notification);
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
    await this.notificationRepository.saveMany(notifications);
  }

  async getAll(userId: string, paginationInput: DateIdPaginationInput) {
    const notifications = await this.notificationRepository.findAllByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getNotificationCursor(
      notifications,
      paginationInput.limit,
    );

    return {
      notifications,
      nextCursor,
    };
  }

  async readAll(userId: string) {
    await this.notificationRepository.readAllByUserId(userId);
  }

  async delete(id: string) {
    await this.notificationRepository.delete(id);
  }

  async deleteAll(userId: string) {
    await this.notificationRepository.deleteAll(userId);
  }
}
