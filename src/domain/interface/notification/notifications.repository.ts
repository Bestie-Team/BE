import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { Notification } from 'src/domain/types/notification.types';
import { DateIdPaginationInput } from 'src/shared/types';

export interface NotificationsRepository {
  save(data: NotificationEntity): Promise<void>;
  saveMany(data: NotificationEntity[]): Promise<void>;
  findAllByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Notification[]>;
  readAllByUserId(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(userId: string): Promise<void>;
}

export const NotificationsRepository = Symbol('NotificationsRepository');
