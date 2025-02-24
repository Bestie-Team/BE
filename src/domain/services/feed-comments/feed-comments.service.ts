import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';
import { FeedCommentPrototype } from 'src/domain/types/feed-comment.types';
import {
  FORBIDDEN_MESSAGE,
  NOT_FOUND_COMMENT_MESSAGE,
} from 'src/domain/error/messages';

@Injectable()
export class FeedCommentsService {
  constructor(
    @Inject(FeedCommentRepository)
    private readonly feedCommentRepository: FeedCommentRepository,
  ) {}

  async create(prototype: FeedCommentPrototype) {
    const stdDate = new Date();
    const comment = FeedCommentEntity.create(prototype, v4, stdDate);
    await this.feedCommentRepository.save(comment);
  }

  async readAll(feedId: string) {
    return await this.feedCommentRepository.findByFeedId(feedId);
  }

  async delete(id: string, userId: string) {
    const comment = await this.feedCommentRepository.findOneById(id);
    if (!comment) {
      throw new NotFoundException(NOT_FOUND_COMMENT_MESSAGE);
    }
    if (comment.writerId !== userId) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
    await this.feedCommentRepository.delete(id);
  }
}
