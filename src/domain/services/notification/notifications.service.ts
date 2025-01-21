import { Inject, Injectable } from '@nestjs/common';
import { getNotificationCursor } from 'src/domain/helpers/get-cursor';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationsRepository)
    private readonly notificationRepository: NotificationsRepository,
  ) {}

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
}
