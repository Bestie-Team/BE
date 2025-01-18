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

  async getAllFeeds(userId: string, feedPaginationInput: FeedPaginationInput) {
    return await this.getFeeds(userId, feedPaginationInput, 'ALL');
  }

  async getMyFeeds(userId: string, feedPaginationInput: FeedPaginationInput) {
    return await this.getFeeds(userId, feedPaginationInput, 'MY');
  }

  private async getFeeds(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
    type: 'ALL' | 'MY',
  ) {
    const { limit } = feedPaginationInput;
    const feeds =
      type === 'ALL'
        ? await this.feedsRepository.findAllByUserId(
            userId,
            feedPaginationInput,
          )
        : await this.feedsRepository.findByUserId(userId, feedPaginationInput);
    const nextCursor = getFeedCursor(feeds, limit);

    return {
      feeds,
      nextCursor,
    };
  }
}
