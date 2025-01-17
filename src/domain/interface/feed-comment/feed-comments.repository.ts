import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';
import { FeedComment } from 'src/domain/types/feed-comment.types';

export interface FeedCommentRepository {
  save(data: FeedCommentEntity): Promise<void>;
  findByFeedId(feedId: string): Promise<FeedComment[]>;
}

export const FeedCommentRepository = Symbol('FeedCommentRepository');
