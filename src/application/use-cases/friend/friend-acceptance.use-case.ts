import { Injectable } from '@nestjs/common';
import { FriendAcceptanceInput } from 'src/application/types/friend.types';
import { APP_NAME } from 'src/common/constant';
import { FriendWriteService } from 'src/domain/services/friend/friend-write.service';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';

@Injectable()
export class FriendAcceptanceUseCase {
  constructor(
    private readonly friendWriteService: FriendWriteService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: FriendAcceptanceInput) {
    const { senderId, receiverId, friendId } = input;

    await this.friendWriteService.accept(friendId, receiverId);
    this.notify(senderId, receiverId);
  }

  async notify(senderId: string, receiverId: string) {
    const sender = await this.usersService.getUserByIdOrThrow(senderId);

    if (sender.notificationToken && sender.serviceNotificationConsent) {
      const receiver = await this.usersService.getUserByIdOrThrow(receiverId);
      const message = `${receiver.name}님이 친구 요청을 수락했어요!`;

      this.notificationsService.createV2({
        message,
        relatedId: null,
        title: APP_NAME,
        token: sender.notificationToken,
        type: 'FRIEND_REQUEST_ACCEPTED',
        userId: sender.id,
      });
    }
  }
}
