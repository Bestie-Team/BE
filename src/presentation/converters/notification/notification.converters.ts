import { Notification } from 'src/domain/types/notification.types';
import { NotificationListResponse } from 'src/presentation/dto/notification/response/notification-list.response';
import { DateIdCursor } from 'src/shared/types';

export const notificationConverter = {
  toListDto: (domain: {
    notifications: Notification[];
    nextCursor: DateIdCursor | null;
  }): NotificationListResponse => {
    const { notifications, nextCursor } = domain;
    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null,
      })),
      nextCursor,
    };
  },
};
