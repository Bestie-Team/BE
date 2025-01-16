import { Feed } from 'src/domain/types/feed.types';
import { FeedListResponse } from 'src/presentation/dto/feed/response/feed-list.response';

export const feedConverter = {
  toListDto: ({
    feeds,
    nextCursor,
  }: {
    feeds: Feed[];
    nextCursor: { createdAt: string; id: string } | null;
  }): FeedListResponse => {
    return {
      feeds: feeds.map((feed) => ({
        ...feed,
        createdAt: feed.createdAt.toISOString(),
      })),
      nextCursor,
    };
  },
};
