import { BlockedFeedCommentEntity } from 'src/domain/entities/feed-comment/blocked-feed-comment.entity';

export interface BlockedFeedCommentRepository {
  save(blockedFeedComment: BlockedFeedCommentEntity): Promise<void>;
}

export const BlockedFeedCommentRepository = Symbol(
  'BlockedFeedCommentRepository',
);
