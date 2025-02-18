import { BadRequestException, Injectable } from '@nestjs/common';
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
    this.validate(groupId, friendUserIds);

    let inviteeIds: string[] = [];

    if (groupId) {
      inviteeIds = (
        await this.groupsService.getParticipantsById(groupId)
      ).filter((userId) => userId !== hostUserId);
    }
    if (friendUserIds) {
      inviteeIds = friendUserIds;
      await this.gatheringsWriteService.checkIsFriend(
        hostUserId,
        friendUserIds,
      );
    }

    await this.createGathering(input, inviteeIds);
    this.notify(hostUserId, inviteeIds);
  }

  private validate(groupId: string | null, friendUserIds: string[] | null) {
    if (!groupId && !friendUserIds) {
      throw new BadRequestException(
        '그룹 번호 또는 친구 번호는 필수로 제공되어야 합니다.',
      );
    }
    if (groupId && friendUserIds) {
      throw new BadRequestException(
        '그룹 번호와 친구 번호는 동시에 제공될 수 없습니다. 둘 중 하나만 선택해주세요.',
      );
    }
  }

  private async createGathering(
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

  private async notify(senderId: string, receiverIds: string[]) {
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

  private async publishNotification(payload: NotificationPayload) {
    this.eventEmitter.emit('notify', payload);
  }
}
