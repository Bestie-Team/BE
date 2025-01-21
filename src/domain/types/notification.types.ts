export interface NotificationPrototype {
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly relatedId: string | null;
}

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly relatedId: string | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}
