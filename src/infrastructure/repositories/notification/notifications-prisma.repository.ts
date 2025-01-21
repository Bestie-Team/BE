import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';

@Injectable()
export class NotificationsPrismaRepository implements NotificationsRepository {}
