import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME } from 'src/common/constant';
import { GroupsWriter } from 'src/domain/components/group/groups-writer';
import { NotificationsService } from 'src/domain/components/notification/notifications.service';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { GroupPrototype } from 'src/domain/types/group.types';

@Injectable()
export class GroupCreationUseCase {
  private readonly logger = new Logger('GroupCreationUseCase');

  constructor(
    private readonly groupsWriteService: GroupsWriter,
    private readonly groupsService: GroupsService,
    private readonly usersReader: UsersReader,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: GroupPrototype, inviteeIds: string[]) {
    const { name, ownerId } = input;
    await this.groupsService.create(input, inviteeIds);
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
    const sender = await this.usersReader.readOne(senderId);
    const invitees = await this.usersReader.readMulti(inviteeIds);

    const notificationPromises = invitees.map(async (invitee) => {
      return this.notificationsService
        .createV2({
          message: `${sender.name}님이 ${groupName} 그룹에 초대했어요!`,
          type: 'GROUP_INVITATION',
          title: APP_NAME,
          userId: invitee.id,
          token: invitee.notificationToken,
          serviceNotificationConsent: invitee.serviceNotificationConsent,
          relatedId: null,
        })
        .catch((e: Error) =>
          this.logger.log({
            message: `알림 에러: ${e.message}`,
            stack: e.stack,
            timestamp: new Date().toISOString(),
          }),
        );
    });

    Promise.all(notificationPromises);
  }
}
