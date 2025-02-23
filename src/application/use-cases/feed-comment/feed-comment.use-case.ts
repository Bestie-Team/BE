import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME } from 'src/common/constant';
import { FeedCommentsService } from 'src/domain/services/feed-comment/feed-comments.service';
import { FeedsReader } from 'src/domain/services/feed/feeds-reader';
import { NotificationsService } from 'src/domain/services/notification/notifications.service';
import { UsersService } from 'src/domain/services/user/users.service';
import { FeedCommentPrototype } from 'src/domain/types/feed-comment.types';

@Injectable()
export class FeedCommentCreationUseCase {
  private readonly logger = new Logger('FeedCommentCreationUseCase');

  constructor(
    private readonly feedCommentsService: FeedCommentsService,
    private readonly feedsReadService: FeedsReader,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(input: FeedCommentPrototype) {
    const { writerId, feedId } = input;

    await this.feedCommentsService.create(input);
    this.notify(feedId, writerId);
  }

  async notify(feedId: string, writerId: string) {
    const feed = await this.feedsReadService.getByIdOrThrow(feedId);

    if (feed.writerId === writerId) {
      return;
    }

    const feedWriter = await this.usersService.getUserByIdOrThrow(
      feed.writerId,
    );

    if (feedWriter.notificationToken && feedWriter.serviceNotificationConsent) {
      const commentWriter = await this.usersService.getUserByIdOrThrow(
        writerId,
      );

      this.notificationsService
        .createV2({
          message: `${commentWriter.name}님이 회원님의 피드에 댓글을 달았어요!`,
          type: 'FEED_COMMENT',
          title: APP_NAME,
          userId: feedWriter.id,
          token: feedWriter.notificationToken,
          relatedId: feedId,
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
