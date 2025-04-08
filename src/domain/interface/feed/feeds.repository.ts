import { FeedImageEntity } from 'src/domain/entities/feed/feed-image.entity';
import { FeedEntity } from 'src/domain/entities/feed/feed.entity';
import {
  Feed,
  FeedPaginationInput,
  FeedDetail,
} from 'src/domain/types/feed.types';
import { DateIdPaginationInput } from 'src/shared/types';

export interface FeedsRepository {
  save(data: FeedEntity, images: FeedImageEntity[]): Promise<void>;
  update(id: string, data: Partial<FeedEntity>): Promise<void>;
  findDetailById(id: string): Promise<FeedDetail | null>;
  findOneById(id: string): Promise<{ id: string; writerId: string } | null>;
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
  findByUserId(
    userId: string,
    feedPaginationInput: FeedPaginationInput,
  ): Promise<Feed[]>;
  findBlockedFeedsByUserId(
    userId: string,
    paginationInput: DateIdPaginationInput,
  ): Promise<Feed[]>;
  delete(id: string): Promise<void>;
}

export const FeedsRepository = Symbol('FeedsRepository');
