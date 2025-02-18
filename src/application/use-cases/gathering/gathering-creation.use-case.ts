import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_NAME } from 'src/common/constant';
import { GatheringInvitationsWriteService } from 'src/domain/services/gathering/gathering-invitations-write.service';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { GroupsService } from 'src/domain/services/group/groups.service';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';
import { GatheringPrototype } from 'src/domain/types/gathering.types';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { NotificationPayload } from 'src/infrastructure/types/notification.types';

@Injectable()
export class GatheringCreationUseCase {
  constructor(
    private readonly gatheringsWriteService: GatheringsWriteService,
    private readonly gatheringParticipationsWriteService: GatheringInvitationsWriteService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: GatheringPrototype, friendUserIds: string[] | null) {
    const { groupId, hostUserId } = input;

    let receiverIds: string[] = [];

    if (groupId) {
      receiverIds = (
        await this.groupsService.getParticipantsById(groupId)
      ).filter((userId) => userId !== hostUserId);
      await this.createGroupGathering(input, receiverIds);
    }
    if (groupId === null && friendUserIds !== null) {
      receiverIds = friendUserIds;
      await this.createFriendGathering(input, friendUserIds);
    }

    this.notify(hostUserId, receiverIds);
  }

  async notify(senderId: string, receiverIds: string[]) {
    const sender = await this.usersService.getUserByIdOrThrow(senderId);
    const receivers = await this.usersService.getUsersByIds(receiverIds);

    const validReceivers = receivers.filter(
      (receiver) =>
        receiver.notificationToken && receiver.serviceNotificationConsent,
    );

    const prototypes: NotificationPrototype[] = validReceivers.map(() => ({
      type: 'GATHERING_INVITATION_RECEIVED',
      userId: senderId,
      title: APP_NAME,
      message: `${sender.name}님이 약속 초대장을 보냈어요!`,
      relatedId: null,
    }));

    if (validReceivers.length > 0) {
      this.notificationsService.createNotifications(prototypes);
      validReceivers.forEach((receiver) =>
        this.publishNotification({
          title: APP_NAME,
          body: `${sender.name}님이 약속 초대장을 보냈어요!`,
          token: receiver.notificationToken as string,
        }),
      );
    }
  }

  async publishNotification(payload: NotificationPayload) {
    this.eventEmitter.emit('notify', payload);
  }

  async createGroupGathering(
    prototype: GatheringPrototype,
    friendUserIds: string[],
  ) {
    const gathering = this.gatheringsWriteService.createGathering(prototype);
    const invitations =
      this.gatheringParticipationsWriteService.createGatheringInvitations(
        gathering.id,
        friendUserIds,
      );

    return await this.gatheringsWriteService.createTransaction(
      gathering,
      invitations,
    );
  }

  private async createFriendGathering(
    prototype: GatheringPrototype,
    friendUserIds: string[],
  ) {
    const { hostUserId } = prototype;
    await this.gatheringsWriteService.checkIsFriend(hostUserId, friendUserIds);

    const gathering = this.gatheringsWriteService.createGathering(prototype);
    const invitations =
      this.gatheringParticipationsWriteService.createGatheringInvitations(
        gathering.id,
        friendUserIds,
      );

    return await this.gatheringsWriteService.createTransaction(
      gathering,
      invitations,
    );
  }
}
