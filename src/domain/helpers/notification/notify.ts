import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { NotificationPrototype } from 'src/domain/types/notification.types';

export const notify = (
  input: NotificationPrototype,
  repository: NotificationsRepository,
) => {
  const stdDate = new Date();
  const notification = NotificationEntity.create(input, v4, stdDate);

  // TODO 알림 보내는 로직

  repository.save(notification);
};
