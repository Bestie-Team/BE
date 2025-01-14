import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';

export interface FeedsRepository {
  save(data: FeedEntity, images: FeedImageEntity[]): Promise<void>;
  update(id: string, data: Partial<FeedEntity>): Promise<void>;
  findOneByIdAndWriter(
    feedId: string,
    writerId: string,
  ): Promise<{ id: string } | null>;
}

export const FeedsRepository = Symbol('FeedsRepository');
