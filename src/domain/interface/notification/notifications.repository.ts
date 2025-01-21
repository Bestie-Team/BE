import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';

export interface NotificationsRepository {
  save(data: NotificationEntity): Promise<void>;
}

export const NotificationsRepository = Symbol('NotificationsRepository');
