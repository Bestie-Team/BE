import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import { Feed, FeedPaginationInput } from 'src/domain/types/feed.types';

export interface FeedsRepository {
  save(data: FeedEntity, images: FeedImageEntity[]): Promise<void>;
  update(id: string, data: Partial<FeedEntity>): Promise<void>;
  findOneByIdAndWriter(
    feedId: string,
    writerId: string,
  ): Promise<{ id: string } | null>;
  findOneByGatheringIdAndWriterId(
    gatheringId: string,
    writerId: string,
  ): Promise<{ id: string } | null>;
  findAllByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]>;
}

export const FeedsRepository = Symbol('FeedsRepository');
