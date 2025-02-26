import { Injectable, Logger } from '@nestjs/common';
import { FriendAcceptanceInput } from 'src/application/types/friend.types';
import { APP_NAME } from 'src/common/constant';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { FriendsService } from 'src/domain/services/friends/friends.service';

@Injectable()
export class FriendAcceptanceUseCase {
  private readonly logger = new Logger('FriendAcceptanceUseCase');

  constructor(
    private readonly friendsService: FriendsService,
    private readonly usersReader: UsersReader,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: FriendAcceptanceInput) {
    const { senderId, receiverId } = input;

    await this.friendsService.accept(senderId, receiverId);
    this.notify(senderId, receiverId);
  }

  async notify(senderId: string, receiverId: string) {
    const sender = await this.usersReader.readOne(senderId);
    const receiver = await this.usersReader.readOne(receiverId);
    const message = `${receiver.name}님이 친구 요청을 수락했어요!`;

    this.notificationsService
      .createV2({
        message,
        relatedId: null,
        title: APP_NAME,
        token: sender.notificationToken,
        serviceNotificationConsent: sender.serviceNotificationConsent,
        type: 'FRIEND_REQUEST_ACCEPTED',
        userId: sender.id,
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
