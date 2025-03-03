import { NotificationTypes } from 'src/common/constant';
import { NotificationPrototype } from 'src/domain/types/notification.types';

export class NotificationEntity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly type: NotificationTypes,
    readonly title: string,
    readonly message: string,
    readonly createdAt: Date,
    readonly relatedId: string | null = null,
    readonly readAt: Date | null = null,
  ) {}

  static create(
    proto: NotificationPrototype,
    idGen: () => string,
    stdDate: Date,
  ): NotificationEntity {
    return {
      ...proto,
      id: idGen(),
      createdAt: stdDate,
      relatedId: null,
      readAt: null,
    };
  }
}
