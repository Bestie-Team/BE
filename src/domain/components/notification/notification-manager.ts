import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { NotificationEntity } from 'src/domain/entities/notification/notification.entity';
import { NotificationPrototype } from 'src/domain/types/notification.types';
import { EventPublisher } from 'src/infrastructure/event/publishers/interface/event-publisher';
import { UsersReader } from 'src/domain/components/user/users-reader';
import { NotificationsWriter } from 'src/domain/components/notification/notifications-writer';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';

@Injectable()
export class NotificationsManager {
  private readonly logger = new Logger('NotificationsManager');

  constructor(
    @Inject(EventPublisher)
    private readonly eventPublisher: EventPublisher,
    private readonly notificationsWriter: NotificationsWriter,
    private readonly usersReader: UsersReader,
    private readonly feedsReader: FeedsReader,
  ) {}

  async create(
    input: NotificationPrototype & {
      token: string | null;
      serviceNotificationConsent: boolean;
    },
  ) {
    const stdDate = new Date();
    const notification = NotificationEntity.create(input, v4, stdDate);
    this.notificationsWriter.create(notification);

    if (
      process.env.NODE_ENV !== 'test' &&
      input.token &&
      input.serviceNotificationConsent
    ) {
      this.eventPublisher.publish('notify', {
        body: input.message,
        title: input.title,
        token: input.token,
      });
    }
  }

  async sendGatheringCreation(hostUserId: string, inviteeIds: string[]) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const inviteeWithoutHost = inviteeIds.filter(
      (inviteeId) => inviteeId !== hostUserId,
    );
    const hostUser = await this.usersReader.readOne(hostUserId);
    const invitees = await this.usersReader.readMulti(inviteeWithoutHost);

    const notificationPromises = invitees.map(async (invitee) => {
      return this.create({
        message: `${hostUser.name}님이 약속 초대장을 보냈어요!`,
        type: 'GATHERING_INVITATION_RECEIVED',
        title: '약속 초대장',
        userId: invitee.id,
        token: invitee.notificationToken,
        serviceNotificationConsent: invitee.serviceNotificationConsent,
        relatedId: null,
      }).catch((e: Error) =>
        this.logger.log({
          message: `알림 에러: ${e.message}`,
          stack: e.stack,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    Promise.all(notificationPromises);
  }

  async notifyFeedCommentAndMention(
    feedId: string,
    writerId: string,
    mentionUserId?: string | null,
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      const feed = await this.feedsReader.readOne(feedId);

      const [feedWriter, commentWriter] = await Promise.all([
        await this.usersReader.readOne(feed.writerId),
        await this.usersReader.readOne(writerId),
      ]);

      if (mentionUserId) {
        const mentionedUser = await this.usersReader.readOne(mentionUserId);

        await this.create({
          message: `${commentWriter.name}님이 회원님을 멘션했어요!`,
          type: 'FEED_COMMENT_MENTIONED',
          title: '멘션',
          userId: mentionedUser.id,
          token: mentionedUser.notificationToken,
          serviceNotificationConsent: mentionedUser.serviceNotificationConsent,
          relatedId: feedId,
        });
      }

      if (feed.writerId !== mentionUserId && feed.writerId !== writerId) {
        await this.create({
          message: `${commentWriter.name}님이 회원님의 피드에 댓글을 달았어요!`,
          type: 'FEED_COMMENT',
          title: '댓글',
          userId: feedWriter.id,
          token: feedWriter.notificationToken,
          serviceNotificationConsent: feedWriter.serviceNotificationConsent,
          relatedId: feedId,
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.log({
          message: `댓글 알림 에러: ${e.message}`,
          stack: e.stack,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  async notifyFriendFeedCreation(
    feedId: string,
    writerId: string,
    taggedUserIds: string[],
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      if (taggedUserIds.length === 0) {
        return;
      }

      const [writer, taggedUsers] = await Promise.all([
        this.usersReader.readOne(writerId),
        this.usersReader.readMulti(taggedUserIds),
      ]);

      const notificationPromises = taggedUsers.map(async (taggedUser) => {
        await this.create({
          message: `${writer.name} 님이 추억 피드를 올렸어요!`,
          type: 'FRIEND_FEED_WRITEN',
          title: '피드',
          userId: taggedUser.id,
          token: taggedUser.notificationToken,
          serviceNotificationConsent: taggedUser.serviceNotificationConsent,
          relatedId: feedId,
        });
      });

      await Promise.all(notificationPromises);
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error({
          message: `피드 태그 알림 에러: ${e.message}`,
          stack: e.stack,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  // async notifyGatheringFeedCreation() {}
}
