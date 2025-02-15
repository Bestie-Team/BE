import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendWriteService } from 'src/domain/services/friend/friend-write.service';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';
import { FriendPrototype } from 'src/domain/types/friend.types';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { NotificationPayload } from 'src/infrastructure/types/notification.types';

@Injectable()
export class FriendRequestUseCase {
  constructor(
    private readonly friendWriteService: FriendWriteService,
    private readonly notificationService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: FriendPrototype) {
    const { receiverId, senderId } = input;
    const receiver = await this.usersService.getUserByIdOrThrow(receiverId);
    const sender = await this.usersService.getUserByIdOrThrow(senderId);

    await this.transaction(input, {
      message: this.generateNotificationMessage(sender.name),
      title: 'LIGHTY',
      type: 'FRIEND_REQUEST',
      userId: receiverId,
      relatedId: null,
    });

    if (receiver.notificationToken && receiver.serviceNotificationConsent) {
      this.publicNotification({ token: 'token', title: 'title', body: 'body' });
    }
  }

  @Transactional()
  async transaction(
    friendInput: FriendPrototype,
    notificationInput: NotificationPrototype,
  ) {
    await this.friendWriteService.request(friendInput);
    await this.notificationService.create(notificationInput);
  }

  private generateNotificationMessage(receiverName: string): string {
    return `${receiverName}님이 친구 요청을 보냈어요.`;
  }

  async publicNotification(payload: NotificationPayload) {
    this.eventEmitter.emit('notify', payload);
  }
}
