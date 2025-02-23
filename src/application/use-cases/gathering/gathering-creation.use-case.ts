import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { APP_NAME } from 'src/common/constant';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { GatheringsWriter } from 'src/domain/components/gathering/gatherings-writer';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersService } from 'src/domain/components/user/users.service';
import { GatheringPrototype } from 'src/domain/types/gathering.types';

@Injectable()
export class GatheringCreationUseCase {
  private readonly logger = new Logger('GatheringCreationUseCase');

  constructor(
    private readonly gatheringsWriteService: GatheringsWriter,
    private readonly gatheringParticipationsWriteService: GatheringInvitationsWriter,
    private readonly groupsService: GroupsReader,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: GatheringPrototype, friendUserIds: string[] | null) {
    const { groupId, hostUserId } = input;
    this.validate(groupId, friendUserIds);

    let inviteeIds: string[] = [];

    if (groupId) {
      inviteeIds = await this.groupsService.getParticipantsById(groupId);
    }
    if (friendUserIds) {
      inviteeIds = [...friendUserIds, hostUserId];
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
        '그룹 번호와 친구 번호는 동시에 제공될 수 없습니다.',
      );
    }
  }

  private async createGathering(
    prototype: GatheringPrototype,
    inviteeIds: string[],
  ) {
    const gathering = this.gatheringsWriteService.createGathering(prototype);
    const invitations =
      this.gatheringParticipationsWriteService.createGatheringInvitations(
        gathering.id,
        inviteeIds,
      );

    return await this.transaction(gathering, invitations);
  }

  @Transactional()
  private async transaction(
    gathering: GatheringEntity,
    invitations: GatheringParticipationEntity[],
  ) {
    await this.gatheringsWriteService.create(gathering);
    await this.gatheringParticipationsWriteService.createMany(invitations);
    const hostParticipation = invitations.find(
      (invitation) => invitation.participantId === gathering.hostUserId,
    ) as GatheringParticipationEntity;
    await this.gatheringParticipationsWriteService.acceptV2(
      hostParticipation.id,
    );
  }

  private async notify(senderId: string, receiverIds: string[]) {
    const sender = await this.usersService.getUserByIdOrThrow(senderId);
    const receivers = await this.usersService.getUsersByIds(receiverIds);

    const notificationPromises = receivers.map(async (receiver) => {
      if (receiver.notificationToken && receiver.serviceNotificationConsent) {
        return this.notificationsService
          .createV2({
            message: `${sender.name}님이 약속 초대장을 보냈어요!`,
            type: 'GATHERING_INVITATION_RECEIVED',
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
    });

    Promise.all(notificationPromises);
  }
}
