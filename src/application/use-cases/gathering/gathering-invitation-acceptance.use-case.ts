import { Injectable, Logger } from '@nestjs/common';
import { InvitationAcceptanceInput } from 'src/application/types/gathering.types';
import { APP_NAME } from 'src/common/constant';
import { GatheringInvitationsWriter } from 'src/domain/services/gathering/gathering-invitations-writer';
import { GatheringsReader } from 'src/domain/services/gathering/gatherings-reader';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';

@Injectable()
export class GatheringInvitationAcceptanceUseCase {
  private readonly logger = new Logger('GatheringInvitationAcceptanceUseCase');

  constructor(
    private readonly gatheringInvitationsWriteService: GatheringInvitationsWriter,
    private readonly gatheringsReadService: GatheringsReader,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
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
        .createV2({
          message,
          type: 'GATHERING_INVITATION_ACCEPTED',
          title: APP_NAME,
          userId: hostUser.id,
          token: hostUser.notificationToken,
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
}
