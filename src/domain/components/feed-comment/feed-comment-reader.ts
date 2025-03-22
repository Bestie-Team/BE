import { Inject, Injectable } from '@nestjs/common';
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
}
