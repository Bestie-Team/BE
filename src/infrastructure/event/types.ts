export interface Event {
  notify: NotificationPayload;
}

export interface NotificationPayload {
  readonly token: string;
  readonly title: string;
  readonly body: string;
}
