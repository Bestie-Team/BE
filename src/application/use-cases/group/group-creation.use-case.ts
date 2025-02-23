import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME } from 'src/common/constant';
import { GroupsWriter } from 'src/domain/services/group/groups-writer';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';
import { GroupPrototype } from 'src/domain/types/group.types';

@Injectable()
export class GroupCreationUseCase {
  private readonly logger = new Logger('GroupCreationUseCase');

  constructor(
    private readonly groupsWriteService: GroupsWriter,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: GroupPrototype, inviteeIds: string[]) {
    const { name, ownerId } = input;
    await this.groupsWriteService.create(input, inviteeIds);
    this.notify(
      name,
      ownerId,
      inviteeIds.filter((inviteeId) => inviteeId !== ownerId),
    );
  }

  private async notify(
    groupName: string,
    senderId: string,
    inviteeIds: string[],
  ) {
    const sender = await this.usersService.getUserByIdOrThrow(senderId);
    const invitees = await this.usersService.getUsersByIds(inviteeIds);

    const notificationPromises = invitees.map(async (invitee) => {
      if (invitee.notificationToken && invitee.serviceNotificationConsent) {
        return this.notificationsService
          .createV2({
            message: `${sender.name}님이 ${groupName} 그룹에 초대했어요!`,
            type: 'GROUP_INVITATION',
            title: APP_NAME,
            userId: invitee.id,
            token: invitee.notificationToken,
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
