import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME } from 'src/common/constant';
import { FriendsWriter } from 'src/domain/components/friend/friends-writer';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersService } from 'src/domain/components/user/users.service';
import { FriendPrototype } from 'src/domain/types/friend.types';

@Injectable()
export class FriendRequestUseCase {
  private readonly logger = new Logger('FriendRequestUseCase');

  constructor(
    private readonly friendWriteService: FriendsWriter,
    private readonly notificationService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(input: FriendPrototype) {
    const { receiverId, senderId } = input;

    await this.friendWriteService.checkExistFriend(senderId, receiverId);
    await this.friendWriteService.request(input);

    this.notify(senderId, receiverId);
  }

  async notify(senderId: string, receiverId: string) {
    const receiver = await this.usersService.getUserByIdOrThrow(receiverId);

    if (receiver.notificationToken && receiver.serviceNotificationConsent) {
      const sender = await this.usersService.getUserByIdOrThrow(senderId);
      const message = `${sender.name}님이 친구 요청을 보냈어요!`;

      this.notificationService
        .createV2({
          message,
          type: 'FRIEND_REQUEST',
          title: APP_NAME,
          userId: receiver.id,
          token: receiver.notificationToken,
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
}
