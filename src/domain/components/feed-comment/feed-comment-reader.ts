import { Inject, Injectable } from '@nestjs/common';
import { CommentNotFoundException } from 'src/domain/error/exceptions/not-found.exception';
import { FeedCommentRepository } from 'src/domain/interface/feed-comment/feed-comments.repository';

@Injectable()
export class FeedCommentsReader {
  constructor(
    @Inject(FeedCommentRepository)
    private readonly feedCommentRepository: FeedCommentRepository,
  ) {}

  async readAll(feedId: string, userId: string) {
    return await this.feedCommentRepository.findByFeedId(feedId, userId);
  }

  async readOne(id: string) {
    const comment = await this.feedCommentRepository.findOneById(id);
    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }
}
