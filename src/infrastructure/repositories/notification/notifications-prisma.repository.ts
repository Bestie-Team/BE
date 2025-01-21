import { Injectable } from '@nestjs/common';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class NotificationsPrismaRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: NotificationEntity): Promise<void> {
    await this.prisma.notification.create({ data });
  }
}
