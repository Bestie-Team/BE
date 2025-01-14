import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';

export interface FeedsRepository {
  save(data: FeedEntity, images: FeedImageEntity[]): Promise<void>;
}

export const FeedsRepository = Symbol('FeedsRepository');
