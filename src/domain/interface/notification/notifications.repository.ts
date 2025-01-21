import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { Notification } from 'src/domain/types/notification.types';
import { DateIdPaginationInput } from 'src/shared/types';

export interface NotificationsRepository {
  save(data: NotificationEntity): Promise<void>;
  findAllByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Notification[]>;
}

export const NotificationsRepository = Symbol('NotificationsRepository');
