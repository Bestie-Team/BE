import { FeedCommentEntity } from 'src/domain/entities/feed-comment/feed-comment.entity';

export interface FeedCommentRepository {
  save(data: FeedCommentEntity): Promise<void>;
}

export const FeedCommentRepository = Symbol('FeedCommentRepository');
