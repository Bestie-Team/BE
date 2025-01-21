import { Injectable } from '@nestjs/common';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationsRepository } from 'src/domain/interface/notification/notifications.repository';
import { Notification } from 'src/domain/types/notification.types';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class NotificationsPrismaRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: NotificationEntity): Promise<void> {
    await this.prisma.notification.create({ data });
  }

  async findAllByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Notification[]> {
    const { cursor, limit } = paginationInput;
    return await this.prisma.notification.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        relatedId: true,
        readAt: true,
        createdAt: true,
      },
      where: {
        userId,
        OR: [
          {
            createdAt: {
              lt: new Date(cursor.createdAt),
            },
          },
          { createdAt: new Date(cursor.createdAt), id: { gt: cursor.id } },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: limit,
    });
  }

  async readAllByUserId(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      data: {
        readAt: new Date(),
      },
      where: {
        userId,
        readAt: null,
      },
    });
  }
}
