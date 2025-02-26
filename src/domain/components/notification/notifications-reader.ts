import { Inject, Injectable } from '@nestjs/common';
import { getNotificationCursor } from 'src/domain/helpers/get-cursor';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class NotificationsReader {
  constructor(
    @Inject(NotificationsRepository)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async read(userId: string, paginationInput: DateIdPaginationInput) {
    const notifications = await this.notificationsRepository.findAllByUserId(
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
    await this.notificationsRepository.readAllByUserId(userId);
  }
}
