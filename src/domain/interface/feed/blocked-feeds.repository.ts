import { BlockedFeedEntity } from 'src/domain/entities/feed/blocked-feed.entity';

export interface BlockedFeedsRepository {
  save(data: BlockedFeedEntity): Promise<void>;
  delete(userId: string, feedId: string): Promise<void>;
}

export const BlockedFeedsRepository = Symbol('BlockedFeedRepository');
