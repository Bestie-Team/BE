import { Inject, Injectable } from '@nestjs/common';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { getFeedCursor } from 'src/domain/helpers/get-cursor';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { FeedsRepository } from 'src/domain/interface/feed/feeds.repository';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class BlockedFeedsService {
  constructor(
    @Inject(BlockedFeedsRepository)
    private readonly blockedFeedsRepository: BlockedFeedsRepository,
    @Inject(FeedsRepository)
    private readonly feedsRepository: FeedsRepository,
  ) {}

  async block(userId: string, feedId: string) {
    const stdDate = new Date();
    const blockedFeed = BlockedFeedEntity.create({ userId, feedId }, stdDate);
    await this.blockedFeedsRepository.save(blockedFeed);
  }

  async unblock(userId: string, feedId: string) {
    await this.blockedFeedsRepository.delete(userId, feedId);
  }

  async getBlockedFeeds(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ) {
    const feeds = await this.feedsRepository.findBlockedFeedsByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getFeedCursor(feeds, paginationInput.limit);

    return {
      feeds,
      nextCursor,
    };
  }
}
