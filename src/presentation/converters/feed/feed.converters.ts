import { Feed, FeedDetail } from 'src/domain/types/feed.types';
import { User } from 'src/domain/types/user.types';
import { FeedDetailResponse } from 'src/presentation/dto/feed/response/feed-detail.response';
import { FeedListResponse } from 'src/presentation/dto/feed/response/feed-list.response';

export const feedConverter = {
  toDetailDto: (feed: FeedDetail, withMembers: User[]): FeedDetailResponse => {
    const { gathering, createdAt, gatheringId, ...rest } = feed;

    return {
      ...rest,
      withMembers: withMembers.filter((member) => member.id !== feed.writer.id),
      gathering: gathering
        ? { ...gathering, gatheringDate: gathering.gatheringDate.toISOString() }
        : null,
      createdAt: createdAt.toISOString(),
    };
  },
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
        gathering: feed.gathering
          ? {
              ...feed.gathering,
              gatheringDate: feed.gathering?.gatheringDate.toISOString(),
            }
          : null,
        createdAt: feed.createdAt.toISOString(),
      })),
      nextCursor,
    };
  },
};
