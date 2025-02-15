import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import admin from 'firebase-admin';
import { NotificationPayload } from 'src/infrastructure/types/notification.types';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger('Notification Listener');

  constructor(private readonly config: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get<string>('FCM_PROJECT_ID'),
        privateKey: this.config.get<string>('FCM_PRIVATE_KEY'),
        clientEmail: this.config.get<string>('FCM_CLIENT_EMAIL'),
      }),
    });
  }

  @OnEvent('notify')
  async handleNotify(payload: NotificationPayload) {
    const { token, title, body } = payload;
    admin
      .messaging()
      .send({
        token,
        notification: {
          title,
          body,
        },
      })
      .catch((e) => {
        this.logger.log('알림 전송 실패', e);
      });
  }
}
