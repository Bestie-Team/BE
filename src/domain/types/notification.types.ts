import { NotificationTypes } from 'src/common/constant';

export interface NotificationPrototype {
  readonly userId: string;
  readonly type: NotificationTypes;
  readonly title: string;
  readonly message: string;
  readonly relatedId: string | null;
}

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationTypes;
  readonly title: string;
  readonly message: string;
  readonly relatedId: string | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}
