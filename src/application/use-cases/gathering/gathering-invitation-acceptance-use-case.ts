import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvitationAcceptanceInput } from 'src/application/types/gathering.types';
import { APP_NAME } from 'src/common/constant';
import { GatheringInvitationsWriteService } from 'src/domain/services/gathering/gathering-invitations-write.service';
import { GatheringsReadService } from 'src/domain/services/gathering/gatherings-read.service';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';
import { NotificationPayload } from 'src/infrastructure/types/notification.types';

@Injectable()
export class GatheringInvitationAcceptanceUseCase {
  private readonly logger = new Logger('GatheringInvitationAcceptanceUseCase');

  constructor(
    private readonly gatheringInvitationsWriteService: GatheringInvitationsWriteService,
    private readonly gatheringsReadService: GatheringsReadService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: InvitationAcceptanceInput) {
    const { gatheringId, invitationId, inviteeId } = input;

    await this.gatheringInvitationsWriteService.accept(invitationId, inviteeId);
    this.notify(gatheringId, inviteeId);
  }

  async notify(gatheringId: string, inviteeId: string) {
    const gathering = await this.gatheringsReadService.getByIdOrThrow(
      gatheringId,
    );
    const hostUser = await this.usersService.getUserByIdOrThrow(
      gathering.hostUserId,
    );

    if (hostUser.notificationToken && hostUser.serviceNotificationConsent) {
      const invitee = await this.usersService.getUserByIdOrThrow(inviteeId);
      const message = `${invitee.name}님이 약속 초대를 수락했어요!`;

      this.notificationsService
        .create({
          type: 'GATHERING_INVITATION_ACCEPTED',
          userId: hostUser.id,
          title: APP_NAME,
          message,
          relatedId: gathering.id,
        })
        .catch((e) => {
          this.logger.log({
            message: `알림 데이터 저장 실패: ${e.message}`,
            timestamp: new Date().toISOString(),
          });
        });
    }
  }

  async publishNotification(payload: NotificationPayload) {
    this.eventEmitter.emit('notify', payload);
  }
}
