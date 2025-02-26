import { Injectable, Logger } from '@nestjs/common';
import { InvitationAcceptanceInput } from 'src/application/types/gathering.types';
import { APP_NAME } from 'src/common/constant';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { GatheringsReader } from 'src/domain/components/gathering/gatherings-reader';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersReader } from 'src/domain/components/user/users-reader';

@Injectable()
export class GatheringInvitationAcceptanceUseCase {
  private readonly logger = new Logger('GatheringInvitationAcceptanceUseCase');

  constructor(
    private readonly gatheringInvitationsWriteService: GatheringInvitationsWriter,
    private readonly gatheringsReadService: GatheringsReader,
    private readonly usersReader: UsersReader,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: InvitationAcceptanceInput) {
    const { gatheringId, invitationId, inviteeId } = input;

    await this.gatheringInvitationsWriteService.accept(invitationId, inviteeId);
    this.notify(gatheringId, inviteeId);
  }

  async notify(gatheringId: string, inviteeId: string) {
    const gathering = await this.gatheringsReadService.readOne(gatheringId);
    const hostUser = await this.usersReader.readOne(gathering.hostUserId);

    const invitee = await this.usersReader.readOne(inviteeId);
    const message = `${invitee.name}님이 약속 초대를 수락했어요!`;

    this.notificationsService
      .createV2({
        message,
        type: 'GATHERING_INVITATION_ACCEPTED',
        title: APP_NAME,
        userId: hostUser.id,
        token: hostUser.notificationToken,
        serviceNotificationConsent: hostUser.serviceNotificationConsent,
        relatedId: gathering.id,
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
