import { Inject, Injectable } from '@nestjs/common';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';

@Injectable()
export class NotificationsWriter {
  constructor(
    @Inject(NotificationsRepository)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(notification: NotificationEntity) {
    this.notificationsRepository.save(notification);
  }

  async createMany(notifications: NotificationEntity[]) {
    await this.notificationsRepository.saveMany(notifications);
  }

  async delete(id: string) {
    await this.notificationsRepository.delete(id);
  }

  async deleteAll(userId: string) {
    await this.notificationsRepository.deleteAll(userId);
  }
}
