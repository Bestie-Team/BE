import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { FriendsService } from 'src/domain/services/friends/friends.service';
import { FriendPrototype } from 'src/domain/types/friend.types';

@Injectable()
export class FriendRequestUseCase {
  private readonly logger = new Logger('FriendRequestUseCase');

  constructor(
    private readonly friendsService: FriendsService,
    private readonly usersReader: UsersReader,
    private readonly notificationService: NotificationsService,
  ) {}

  async execute(input: FriendPrototype) {
    const { receiverId, senderId } = input;

    await this.friendsService.request(input);
    this.notify(senderId, receiverId);
  }

  async notify(senderId: string, receiverId: string) {
    const receiver = await this.usersReader.readOne(receiverId);
    const sender = await this.usersReader.readOne(senderId);
    const message = `${sender.name}님이 친구 요청을 보냈어요!`;

    this.notificationService
      .createV2({
        message,
        type: 'FRIEND_REQUEST',
        title: '친구 요청',
        userId: receiver.id,
        token: receiver.notificationToken,
        serviceNotificationConsent: receiver.serviceNotificationConsent,
        relatedId: null,
      })
      .catch((e: Error) =>
        this.logger.log({
          message: `알림 에러: ${e.message}`,
          stack: e.stack,
          timestamp: new Date().toISOString(),
        }),
      );
  }
}
