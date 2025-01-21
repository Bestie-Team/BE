import type { NotificationTypes } from 'src/common/constant';

export interface NotificationPrototype {
  readonly userId: string;
  readonly type: NotificationTypes;
  readonly title: string;
  readonly message: string;
  readonly relatedId: string | null;
}
