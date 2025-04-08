import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';
import { User } from 'src/domain/types/user.types';

export interface FriendFeedVisibilitiesRepository {
  saveMany(data: FriendFeedVisibilityEntity[]): Promise<void>;
  findVisibleUsersByFeedIds(feedIds: string[]): Promise<{
    [feedId: string]: User[];
  }>;
  findVisibleUsersByFeedId(feedId: string): Promise<User[]>;
}

export const FriendFeedVisibilitiesRepository = Symbol(
  'FriendFeedVisibilitiesRepository',
);
