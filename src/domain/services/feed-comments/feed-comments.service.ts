import { ForbiddenException, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentPrototype } from 'src/domain/types/feed-comment.types';
import { FORBIDDEN_MESSAGE } from 'src/domain/error/messages';
import { FeedCommentsWriter } from 'src/domain/components/feed-comment/feed-comments-writer';
import { FeedCommentsReader } from 'src/domain/components/feed-comment/feed-comment-reader';
import { NotificationsManager } from 'src/domain/components/notification/notification-manager';
import { UsersReader } from 'src/domain/components/user/users-reader';

@Injectable()
export class FeedCommentsService {
  constructor(
    private readonly feedCommentsWriter: FeedCommentsWriter,
    private readonly feedCommentsReader: FeedCommentsReader,
    private readonly usersReader: UsersReader,
    private readonly notifyManager: NotificationsManager,
  ) {}

  async create(prototype: FeedCommentPrototype) {
    const { feedId, writerId, mentionedUserId } = prototype;

    if (mentionedUserId) {
      await this.usersReader.readOne(mentionedUserId);
    }

    const stdDate = new Date();
    const comment = FeedCommentEntity.create(prototype, v4, stdDate);
    await this.feedCommentsWriter.create(comment);

    this.notifyManager.notifyFeedCommentAndMention(
      feedId,
      writerId,
      mentionedUserId,
    );
  }

  async delete(id: string, userId: string) {
    const comment = await this.feedCommentsReader.readOne(id);
    if (comment.writerId !== userId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    await this.feedCommentsWriter.delete(id);
  }
}
