import { FeedComment } from 'src/domain/types/feed-comment.types';
import { FeedCommentResponse } from 'src/presentation/dto/comment/response/feed-comment-list.response';

export const FeedCommentConverter = {
  toListDto: (comments: FeedComment[]): FeedCommentResponse[] => {
    return comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }));
  },
};
