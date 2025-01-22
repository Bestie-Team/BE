import { Inject, Injectable } from '@nestjs/common';
import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';
import { BlockedFeedsRepository } from 'src/domain/interface/feed/blocked-feeds.repository';

@Injectable()
export class BlockedFeedsService {
  constructor(
    @Inject(BlockedFeedsRepository)
    private readonly blockedFeedsRepository: BlockedFeedsRepository,
  ) {}

  async block(userId: string, feedId: string) {
    const stdDate = new Date();
    const blockedFeed = BlockedFeedEntity.create({ userId, feedId }, stdDate);
    await this.blockedFeedsRepository.save(blockedFeed);
  }

  async unblock(userId: string, feedId: string) {
    await this.blockedFeedsRepository.delete(userId, feedId);
  }
}
