import { Inject, Injectable } from '@nestjs/common';
import { FeedsReader } from 'src/domain/components/feed/feeds-reader';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { getFeedCursor } from 'src/domain/helpers/get-cursor';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';
import { DateIdPaginationInput } from 'src/shared/types';

@Injectable()
export class BlockedFeedsService {
  constructor(
    @Inject(BlockedFeedsRepository)
    private readonly blockedFeedsRepository: BlockedFeedsRepository,
    private readonly feedsReader: FeedsReader,
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
    const feeds = await this.feedsReader.readBlocked(userId, paginationInput);
    const nextCursor = getFeedCursor(feeds, paginationInput.limit);

    return {
      feeds,
      nextCursor,
    };
  }
}
