import { Inject, Injectable } from '@nestjs/common';
import { getFeedCursor } from 'src/domain/helpers/get-cursor';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { FeedPaginationInput } from 'src/domain/types/feed.types';

@Injectable()
export class FeedsReadService {
  constructor(
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
  ) {}

  async getFeeds(userId: string, feedPaginationInput: FeedPaginationInput) {
    const { limit } = feedPaginationInput;
    const feeds = await this.feedsRepository.findByUserId(
      userId,
      feedPaginationInput,
    );
    const nextCursor = getFeedCursor(feeds, limit);

    return {
      feeds,
      nextCursor,
    };
  }
}
